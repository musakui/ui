import { isArray, isObject } from './util/type.js'
import { setAttrBindHandler, setRawBindHandler } from './tag/bind.js'
import { setToValue } from './tag/templateFragment.js'
import { toValue } from './signal/base.js'

export function upgradeHandlers() {
	setToValue(toValue)

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

	/** @type {WeakMap<Element, unknown>} */
	const prevVals = new WeakMap()

	setRawBindHandler((el, val) => {
		const prev = prevVals.get(el)
		if (prev && isObject(prev)) {
			// cleanup
		}

		if (!isObject(val)) return false

		for (const [k, v] of Object.entries(val)) {
			//
		}

		prevVals.set(el, val)
		return true
	})
}
