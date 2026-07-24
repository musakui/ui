import { replaceWith } from '#/util/dom.js'
import { setWrap, NO_OP } from './parse.js'
import { TemplateFragment } from './templateFragment.js'

setWrap((s, t) => (t === 'html' ? [s, NO_OP] : [`<${t}>${s}</${t}>`, unwrapTag]))

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

/** @typedef {TemplateFragment<'svg'>} SvgFragment */
/** @typedef {TemplateFragment<'html'>} HtmlFragment */
/** @typedef {TemplateFragment<'mathml'>} MathmlFragment */

/** @param {DocumentFragment} frag */
function unwrapTag(frag) {
	const c = frag.firstChild
	/* v8 ignore else */
	if (c) replaceWith(c, ...c.childNodes)
}
