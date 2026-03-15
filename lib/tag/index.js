import { useNonHTML } from './parse.js'
import { TemplateFragment } from './templateFragment.js'

useNonHTML()

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
