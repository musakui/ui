import * as Bind from './bind.js'
import {
	createElement,
	createComment,
	nodeIterator,
	replaceWith,
	computePath,
	isTextNode,
	getNode,
} from '#/util/dom.js'
import { PersistentFragment } from '#/util/persistentFragment.js'

/** @import { TemplatePart, CachedTemplate, BoundTemplate, NodePath } from './types' */

/** @type {import('./types').WrapFn} */
let wrap = (s) => [s, () => {}]

const MARKER = `ui-${Math.random().toFixed(6).slice(2)}`
const MARKER_REG = `${MARKER}-(\\d+)`
const MARKER_MULTI = new RegExp(MARKER_REG, 'g')
const MARKER_SINGLE = new RegExp(`^\\s*${MARKER_REG}\\s*$`)

/**
 * matches markers between element boundaries
 *
 * lookbehind assertion checks for a full tag (or start of line)
 * main match checks for the marker and ensures no tag `<` appears
 * lookahead assertion checks for `<` of the next tag (or end of line)
 */
// prettier-ignore
const ONLY_HOLES = new RegExp(`(?<=(?:^|<[^>]+>))[^<]*${MARKER}-\\d+[^<]*(?=(?:<|$))`, 'g')

/** @param {string | number} n */
const marker = (n) => `${MARKER}-${n}`

const rawPolicy = { createHTML: /** @param {string} s */ (s) => s }

/** @type {typeof rawPolicy} */
const policy = window?.trustedTypes?.createPolicy('tag', rawPolicy) ?? rawPolicy

/** @type {WeakMap<TemplateStringsArray, CachedTemplate>} */
const tagCache = new WeakMap()

/** @param {string | null} str */
const getMarkerIndex = (str) => {
	if (!str) return null
	const m = MARKER_SINGLE.exec(str)
	return m ? parseInt(m[1]) : null
}

/** @param {string} holes */
const replaceHoles = (holes) => {
	return holes.replaceAll(MARKER_MULTI, (_, i) => `<!--${marker(i)}-->`)
}

/**
 * @param {TemplateStringsArray} strs
 * @param {string} tagType
 */
const getTemplate = (strs, tagType) => {
	const cached = tagCache.get(strs)
	if (cached) return cached
	const made = makeTemplate(strs, tagType)
	tagCache.set(strs, made)
	return made
}

/**
 * @param {TemplateStringsArray} strs
 * @param {string} tagType
 */
const makeTemplate = (strs, tagType) => {
	const content = [strs[0], ...strs.slice(1).flatMap((s, i) => [marker(i), s])]
		.join('')
		.replaceAll(ONLY_HOLES, replaceHoles)
		.trim()

	const wrapped = wrap(content, tagType)
	const templ = createElement('template')
	templ.innerHTML = policy.createHTML(wrapped[0])
	const frag = templ.content
	wrapped[1](frag)
	frag.normalize()

	// bail early when no bindings
	if (strs.length === 1) return /** @type {CachedTemplate} */ ([frag])

	/** @type {import('./types').PartInfo[]} */
	const parts = []
	const elements = []
	const textNodes = []

	/** @type {Map<number, Node>} */
	const holes = new Map()

	/* NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT | NodeFilter.SHOW_COMMENT */
	for (const node of nodeIterator(frag, 133)) {
		const items = []

		if (node.nodeType === /* Node.ELEMENT_NODE */ 1) {
			const el = /** @type {Element} */ (node)
			for (const attr of el.attributes) {
				const idx = getMarkerIndex(attr.name)
				if (idx !== null) {
					items.push(/** @type {const} */ ([Bind.PART_RAW, idx, attr]))
					continue
				}
				const i = getMarkerIndex(attr.value)
				if (i === null) continue
				items.push(/** @type {const} */ ([Bind.PART_ATTR, i, attr]))
			}
			if (items.length) elements.push(/** @type {const} */ ([el, items]))
		} else if (isTextNode(node)) {
			for (const m of node.textContent.matchAll(MARKER_MULTI)) {
				// bind index, marker position, marker length
				items.push(/** @type {const} */ ([parseInt(m[1]), m.index, m[0].length]))
			}
			if (!items.length) continue

			// using `splitText` is easier when traversing backwards
			items.sort((a, b) => b[1] - a[1])

			textNodes.push(/** @type {const} */ ([node, items]))
		} else {
			// comment from replaced hole
			const idx = getMarkerIndex(node.nodeValue)
			if (idx !== null) holes.set(idx, node)
		}
	}

	for (const [text, bs] of textNodes) {
		for (const [idx, pos, len] of bs) {
			// cut text after mark
			text.splitText(pos + len)
			// cut before mark and replace with comment
			const c = createComment(marker(idx))
			replaceWith(text.splitText(pos), c)
			holes.set(idx, c)
		}
	}

	for (const [el, bs] of elements) {
		const pth = computePath(frag, el)
		for (const [t, i, a] of bs) {
			// cleanup from template
			el.removeAttributeNode(a)

			parts[i] = [pth, t, t === Bind.PART_ATTR ? a.name : undefined]
		}
	}

	for (const [i, c] of holes) {
		parts[i] = [computePath(frag, c), Bind.PART_CONTENT]
	}

	return /** @type {CachedTemplate} */ ([frag, parts])
}

/**
 * @param {TemplateStringsArray} strs
 * @param {string} tagType
 */
export const parseTemplate = (strs, tagType) => {
	const [frag, info] = getTemplate(strs, tagType)
	const cloned = document.importNode(frag, true)

	// no bindings
	if (!info) return /** @type {BoundTemplate} */ ([cloned])

	/** @type {WeakMap<NodePath, ChildNode>} */
	const cc = new WeakMap()

	/** @param {NodePath} p */
	const getC = (p) => {
		const node = getNode(cloned, p)
		cc.set(p, node)
		return node
	}

	/**
	 * defer replacements as `PersistentFragment` replaces 1 comment with
	 * 2 comment markers, so path lookups would break due to shifted indices
	 *
	 * @type {[ChildNode, PersistentFragment][]}
	 */
	const replacements = []

	const parts = info.map(([path, t, n]) => {
		const node = cc.get(path) ?? getC(path)
		if (t !== Bind.PART_CONTENT) {
			return /** @type {TemplatePart} */ ([t, /** @type {Element} */ (node), n])
		}
		const pf = new PersistentFragment()
		replacements.push([node, pf])
		return /** @type {TemplatePart} */ ([t, pf])
	})

	for (const [node, pf] of replacements) replaceWith(node, pf)

	return /** @type {BoundTemplate} */ ([cloned, parts])
}

/**
 * @internal
 * @param {typeof wrap} fn
 */
export function setWrap(fn) {
	wrap = fn
}
