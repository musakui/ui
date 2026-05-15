import { effect } from 'alien-signals'
import { toValue } from '#/index.js'

/** @import { HtmlFragment } from '#/index.js' */
/** @import { Signal } from '#/signal/impl.js' */

/**
 * update a signal value based on the previous value
 *
 * @template T
 * @param {Signal<T>} sig
 * @param {(previousVal: T) => T} fn
 */
export function update(sig, fn) {
	sig.value = fn(toValue(sig))
}

/**
 * create a function to bind a Signal to an input element
 *
 * @param {Signal<string>} sig
 */
export function $str(sig) {
	/** @param {HTMLInputElement} el */
	return (el) => {
		const handler = () => {
			sig.value = el.value
		}

		el.addEventListener('input', handler)
		const stop = effect(() => {
			el.value = sig.value
		})

		return () => {
			el.removeEventListener('input', handler)
			stop()
		}
	}
}

/**
 * cache templates via the identity of the object passed into them
 *
 * @template {WeakKey} T
 * @param {(v: T) => HtmlFragment} fn
 */
export function cached(fn) {
	/** @type {WeakMap<T, HTMLElement>} */
	const cache = new WeakMap()

	/** @param {T} val */
	return (val) => {
		const found = cache.get(val)
		if (found) return found
		const el = fn(val).init().el
		if (!el) throw new Error('invalid template')
		cache.set(val, el)
		return el
	}
}
