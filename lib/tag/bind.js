import { initIfTemplate } from './templateFragment.js'
import { isArray, isFunction } from '../util/type.js'
import { replaceChildren, setAttribute } from '../util/dom.js'

/** @type {(h: (v: unknown) => void, c: unknown, n: Node) => void} */
let bindFn = (handler, value) => handler(value)

/** @type {(el: Element, val: unknown) => unknown} */
let handleRawBind = () => undefined

/** @type {(el: Element, name: string) => undefined | ((val: unknown) => void)} */
let handleAttrBind = () => undefined

export const BIND_RAW = /** @type {const} */ ('r')
export const BIND_ATTR = /** @type {const} */ ('a')
export const BIND_CONTENT = /** @type {const} */ ('c')

/** @type {import('./types').BindHandlers} */
const bindHandlers = {
	[BIND_RAW]: ({ el }) => {
		/** @type {unknown} */
		let p
		return (val) => {
			// function raw binds can return a cleanup function
			if (isFunction(p)) p()

			if (handleRawBind(el, val)) return

			if (isFunction(val)) {
				p = val(el)
			}
		}
	},
	[BIND_ATTR]: ({ el, n }) => {
		return handleAttrBind(el, n) ?? ((val) => setAttribute(el, n, val))
	},
	[BIND_CONTENT]: ({ el }) => {
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
	},
}

/**
 * Bind a value to the template.
 *
 * @param {import('./types').TemplateBinding} b
 * @param {unknown} value
 */
export const bindValue = (b, value) => {
	const handler = bindHandlers[b.t](b)
	bindFn(handler, value, b.el)
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
