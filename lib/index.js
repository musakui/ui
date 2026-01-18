import { effect } from 'alien-signals'
import { toValue } from './signal/index.js'
import { setBindFunction, setAttrBindHandler } from './tag/bind.js'
import { isObject } from './util/type.js'

/** @param {unknown} v */
const evtObj = (v) => (isObject(v) ? v : undefined)

const registry = new FinalizationRegistry(/** @param {() => void} c */ (c) => c())

setBindFunction((handler, value, el) => {
	registerEffect(el, () => handler(toValue(value)))
})

setAttrBindHandler((el, n) => {
	const s = n.slice(1)
	switch (n[0]) {
		case '.': // property
			return (val) => {
				el[s] = val
			}
		case '?': // boolean attribute
			return (val) => {
				if (!val === el.hasAttribute(s)) el.toggleAttribute(s)
			}
		case '@': // event listener
			/** @type {unknown} */
			let p
			return (val) => {
				if (p) el.removeEventListener(s, p, evtObj(p))
				el.addEventListener(s, val, evtObj(val))
				p = val
			}
	}
})

export * from './signal/index.js'
export { html } from './tag/index.js'

/**
 * Registers an effect function that will be cleaned up with a DOM node.
 *
 * @param {Node} node
 * @param {() => void} fn
 */
export function registerEffect(node, fn) {
	registry.register(node, effect(fn), node)
}
