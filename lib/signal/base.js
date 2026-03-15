/**
 * lightweight utilities to deal with signals
 *
 * importing directly from this file allows usage without depending on `alien-signals`
 */

/**
 * @param {unknown} v
 * @return {v is BaseSignal<unknown>}
 */
export const isSignal = (v) => v instanceof BaseSignal

/**
 * Unwrap the value from a potential signal.
 *
 * @template T
 * @param {BaseSignal<T> | T} v
 */
export const toValue = (v) => (isSignal(v) ? v._ : v)

/**
 * Abstract base class for signals.
 *
 * @template Init
 * @template [ValType=Init]
 */
export class BaseSignal {
	/** @internal */
	static fn

	/** @param {Init} v */
	constructor(v) {
		/** @internal */
		this.__ = this.constructor.fn(v)
	}

	get [Symbol.toStringTag]() {
		return this.constructor.name
	}

	/** value shorthand */
	get _() {
		return /** @type {ValType} */ (this.__())
	}

	get value() {
		return this._
	}

	valueOf() {
		return this._
	}
}
