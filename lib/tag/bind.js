import { initIfTemplate } from './templateFragment.js'
import { isArray, isFunction } from '#/util/type.js'
import { replaceChildren, setAttribute } from '#/util/dom.js'

/** @type {(h: (v: unknown) => void, c: unknown, n: Node) => void} */
let bindFn = (handler, value) => handler(value)

/** @type {(el: Element, val: unknown) => unknown} */
let handleRawBind = () => undefined

/** @type {(el: Element, name: string) => undefined | ((val: unknown) => void)} */
let handleAttrBind = () => undefined

export const BIND_RAW = /** @type {const} */ ('r')
export const BIND_ATTR = /** @type {const} */ ('a')
export const BIND_CONTENT = /** @type {const} */ ('c')

/** @param {import('./types').TemplateBinding} b */
const getHandler = (b) => {
	const [t, el] = b
	switch (t) {
		case BIND_RAW:
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
		case BIND_ATTR:
			const n = b[2]
			return handleAttrBind(el, n) ?? ((val) => setAttribute(el, n, val))
		case BIND_CONTENT:
			/** @param {unknown} val */
			return (val) => {
				// empty hole
				if (val === null) return replaceChildren(el)

				if (isArray(val)) {
					for (const a of val) initIfTemplate(a)
					replaceChildren(el, ...val)
					return
				}

				initIfTemplate(val)
				replaceChildren(el, val)
			}
	}
}

/**
 * Bind a value to the template.
 *
 * @param {import('./types').TemplateBinding} b
 * @param {unknown} value
 */
export const bindValue = (b, value) => {
	const handler = getHandler(b)
	bindFn(handler, value, b[1])
	return handler
}

/** @param {typeof bindFn} fn */
export function setBindFunction(fn) {
	bindFn = fn
}

/** @param {typeof handleRawBind} fn */
export function setRawBindHandler(fn) {
	handleRawBind = fn
}

/** @param {typeof handleAttrBind} fn */
export function setAttrBindHandler(fn) {
	handleAttrBind = fn
}
