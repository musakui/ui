import { setWrap } from './parse.js'
import { replaceWith } from '#/util/dom.js'
import { TemplateFragment } from './templateFragment.js'

/** @param {DocumentFragment} frag */
const unwrapTag = (frag) => {
	const c = frag.firstChild
	if (c) replaceWith(c, ...c.childNodes)
}

setWrap((s, t) => (t === 'html' ? [s, () => {}] : [`<${t}>${s}</${t}>`, unwrapTag]))

/**
 * Create a SVG fragment.
 *
 * @param {TemplateStringsArray} strs
 * @param {...unknown} vals
 */
export const svg = (strs, ...vals) => new TemplateFragment('svg', strs, ...vals)

/**
 * Create a MathML fragment.
 *
 * @param {TemplateStringsArray} strs
 * @param {...unknown} vals
 */
export const mathml = (strs, ...vals) => new TemplateFragment('mathml', strs, ...vals)

export { html } from './html.js'
