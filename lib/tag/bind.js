import { isNullish, isArray, isFunction } from '#/util/type.js'
import { replaceChildren, setAttribute } from '#/util/dom.js'

/** @type {(el: Element, val: unknown) => unknown} */
let handleRawBind = () => undefined

/** @type {(el: Element, name: string) => undefined | ((val: unknown) => void)} */
let handleAttrBind = () => undefined

export const PART_RAW = /** @type {const} */ ('r')
export const PART_ATTR = /** @type {const} */ ('a')
export const PART_CONTENT = /** @type {const} */ ('c')

/** @param {import('./types').TemplatePart} part */
export function getHandler(part) {
	const [t, el] = part
	switch (t) {
		case PART_RAW:
			/** @type {unknown} */
			let p
			/** @param {unknown} val */
			return (val) => {
				// function raw binds can return a cleanup function
				if (isFunction(p)) p()
				p = undefined

				if (handleRawBind(el, val)) return

				if (isFunction(val)) {
					p = val(el)
				}
			}
		case PART_ATTR:
			const n = part[2]
			return handleAttrBind(el, n) ?? ((val) => setAttribute(el, n, val))
		case PART_CONTENT:
			/** @param {unknown} val */
			return (val) => {
				if (isNullish(val)) {
					replaceChildren(el)
				} else if (isArray(val)) {
					replaceChildren(el, ...val)
				} else {
					replaceChildren(el, val)
				}
			}
	}
}

/** @param {typeof handleRawBind} fn */
export function setRawBindHandler(fn) {
	handleRawBind = fn
}

/** @param {typeof handleAttrBind} fn */
export function setAttrBindHandler(fn) {
	handleAttrBind = fn
}
