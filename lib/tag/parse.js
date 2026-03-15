import * as Bind from './bind.js'
import {
	createElement,
	createComment,
	nodeIterator,
	setAttribute,
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

const DATA_ATTR = `data-${MARKER}`
const DATA_ATTR_QS = `[${DATA_ATTR}]`

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

	/* NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT */
	for (const node of nodeIterator(frag, 5)) {
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
		}
	}

	for (const [text, bs] of textNodes) {
		for (const [idx, pos, len] of bs) {
			// cut text after mark
			text.splitText(pos + len)
			// cut before mark and replace with comment
			replaceWith(text.splitText(pos), createComment(marker(idx)))
		}
	}

	for (const [el, bs] of elements) {
		setAttribute(el, DATA_ATTR, `${bindings.length}`)

		// group all attr bindings on the element
		bindings.push(
			bs.map(([t, i, a]) => {
				// cleanup from template
				el.removeAttributeNode(a)

				return /** @type {const} */ ([i, t, a.name])
			})
		)
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

	const bindings = []
	for (const el of cloned.querySelectorAll(DATA_ATTR_QS)) {
		for (const [i, t, n] of info[parseInt(el.getAttribute(DATA_ATTR) || '')]) {
			bindings[i] = /** @type {TemplateBinding} */ ({ t, el, n })
		}
		setAttribute(el, DATA_ATTR, null)
	}

	for (const node of nodeIterator(cloned, /* NodeFilter.SHOW_COMMENT */ 128)) {
		const idx = getMarkerIndex(node.nodeValue)
		if (idx === null) continue
		const el = new PersistentFragment()
		replaceWith(node, el)
		bindings[idx] = { t: Bind.BIND_CONTENT, el }
	}

	return /** @type {const} */ ([cloned, bindings])
}

export const useNonHTML = () => {
	if (activated) return
	wrap = (s, t) => (t === 'html' ? [s, NO_OP] : [`<${t}>${s}</${t}>`, unwrapTag])
	activated = true
}

function NO_OP() {}
