import { useNonHTML } from './parse.js'
import { TemplateFragment } from './templateFragment.js'

/**
 * Create a HTML fragment.
 *
 * @param {TemplateStringsArray} strs
 * @param {...unknown} vals
 */
export const html = (strs, ...vals) => new TemplateFragment('html', strs, ...vals)

/**
 * Create a SVG fragment.
 *
 * @param {TemplateStringsArray} strs
 * @param {...unknown} vals
 */
export const svg = (strs, ...vals) => {
	useNonHTML()
	return new TemplateFragment('svg', strs, ...vals)
}

/**
 * Create a MathML fragment.
 *
 * @param {TemplateStringsArray} strs
 * @param {...unknown} vals
 */
export const mathml = (strs, ...vals) => {
	useNonHTML()
	return new TemplateFragment('mathml', strs, ...vals)
}
