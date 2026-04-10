import { toValue } from './base.js'
import { signal, computed } from './impl.js'
import { isFunction } from '#/util/type.js'

/** @import { Signal } from './impl' */

/** @param {boolean} val */
const toggleFn = (val) => !val

/**
 * @template T
 * @param {Signal<T>} sig
 * @param {(v: T) => T} fn
 */
export function update(sig, fn) {
	sig.value = fn(toValue(sig))
}

/**
 * @param {Signal<boolean>} sig
 */
export function toggle(sig) {
	return () => update(sig, toggleFn)
}

/**
 * @param {Signal<unknown>} sig
 */
export function not(sig) {
	return computed(() => !toValue(sig))
}

/**
 * @template Val
 * @template ThenResult
 * @template [ElseResult=null]
 * @param {Signal<Val> | (() => Val)} sigOrGetter
 * @param {(v: Val) => ThenResult} thenFn
 * @param {(v: Val) => ElseResult} [elseFn]
 */
export function when(sigOrGetter, thenFn, elseFn) {
	return computed(() => {
		const val = isFunction(sigOrGetter) ? sigOrGetter() : toValue(sigOrGetter)
		return val ? thenFn(val) : /** @type {ElseResult} */ (elseFn?.(val) ?? null)
	})
}

/**
 * @template Pending
 * @template Final
 * @param {Pending} init
 * @param {Promise<Final>} prom
 */
export function deferred(init, prom) {
	const sig = signal(/** @type {Pending | Final} */ (init))

	prom
		.then((v) => {
			sig.value = v
		})
		.catch(() => {
			// eat error
		})

	return sig
}
