import * as Bind from './bind.js'
import {
	createElement,
	createComment,
	nodeIterator,
	replaceWith,
	isTextNode,
} from '#/util/dom.js'
import { PersistentFragment } from '#/util/persistentFragment.js'

/** @import { BoundTemplate, TemplateBinding } from './types' */

/** @type {(s: string, t: string) => [content: string, typeof unwrapTag]}} */
let wrap = (s) => [s, NO_OP]

let activated = false

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

/** @type {WeakMap<TemplateStringsArray, BoundTemplate>} */
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
 * walk the DOM to get the index-based path to a node
 *
 * @param {Node} root
 * @param {Node} target
 */
const computePath = (root, target) => {
	if (!root.contains(target)) throw new Error('target not within root')

	/** @type {number[]} */
	const indexes = []

	while (target !== root) {
		const parent = target.parentNode
		if (!parent) throw new Error('reached a root')

		let i = 0
		let sib = parent.firstChild
		while (sib && sib !== target) {
			++i
			sib = sib.nextSibling
		}

		indexes.push(i)
		target = parent
	}

	return indexes.toReversed()
}

/**
 * @param {Node} node
 * @param {number[]} indexes
 */
const getNode = (node, indexes) => {
	for (const i of indexes) {
		node = node.childNodes[i]
	}
	return /** @type {ChildNode} */ (node)
}

/** @param {DocumentFragment} frag */
const unwrapTag = (frag) => {
	const c = frag.firstChild
	if (c) replaceWith(c, ...c.childNodes)
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
	if (strs.length === 1) return /** @type {BoundTemplate} */ ([frag])

	const bindings = []
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
					items.push(/** @type {const} */ ([Bind.BIND_RAW, idx, attr]))
					continue
				}
				const i = getMarkerIndex(attr.value)
				if (i === null) continue
				items.push(/** @type {const} */ ([Bind.BIND_ATTR, i, attr]))
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
		const path = computePath(frag, el)
		for (const [t, i, a] of bs) {
			// cleanup from template
			el.removeAttributeNode(a)

			bindings[i] = [path, t, t === Bind.BIND_ATTR ? a.name : undefined]
		}
	}

	for (const [i, c] of holes) {
		bindings[i] = [computePath(frag, c), Bind.BIND_CONTENT]
	}

	return /** @type {BoundTemplate} */ ([frag, bindings])
}

/**
 * @param {TemplateStringsArray} strs
 * @param {string} tagType
 */
export const parseTemplate = (strs, tagType) => {
	const [frag, info] = getTemplate(strs, tagType)
	const cloned = document.importNode(frag, true)

	// no bindings
	if (!info) return /** @type {const} */ ([cloned])

	/** @type {WeakMap<number[], ChildNode>} */
	const cc = new WeakMap()

	/** @param {number[]} p */
	const getC = (p) => {
		const node = getNode(cloned, p)
		cc.set(p, node)
		return node
	}

	/** @type {[ChildNode, PersistentFragment][]} */
	const replacements = []

	/** @type {TemplateBinding[]} */
	const bindings = info.map(([path, t, n]) => {
		const node = cc.get(path) ?? getC(path)
		if (t !== Bind.BIND_CONTENT) return [t, node, n]
		const pf = new PersistentFragment()
		replacements.push([node, pf])
		return [t, pf]
	})

	for (const [node, pf] of replacements) replaceWith(node, pf)

	return /** @type {const} */ ([cloned, bindings])
}

export const useNonHTML = () => {
	if (activated) return
	wrap = (s, t) => (t === 'html' ? [s, NO_OP] : [`<${t}>${s}</${t}>`, unwrapTag])
	activated = true
}

function NO_OP() {}
