import { TemplateFragment } from './templateFragment.js'

/**
 * Create a HTML fragment.
 *
 * @param {TemplateStringsArray} strs
 * @param {...unknown} vals
 */
export const html = (strs, ...vals) => new TemplateFragment('html', strs, ...vals)
