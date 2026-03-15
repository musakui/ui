import { isArray, isObject } from './util/type.js'
import { toValue, registerEffect } from './signal/index.js'
import { setBindFunction, setAttrBindHandler } from './tag/bind.js'

export function upgradeHandlers() {
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
				/** @type {[EventListenerOrEventListenerObject, AddEventListenerOptions] | undefined} */
				let p
				return (val) => {
					if (p) el.removeEventListener(s, p[0], p[1])
					p = val
						? isArray(val)
							? [val[0], val[1]]
							: [val, isObject(val) ? val : undefined]
						: undefined
					if (p) el.addEventListener(s, p[0], p[1])
				}
		}
	})
}
