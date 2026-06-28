// lightweight utilities to deal with signals
// importing directly from this file allows usage without depending on `alien-signals`

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
export const toValue = (v) => /** @type {T} */ (isSignal(v) ? v._ : v)

/**
 * Abstract base class for signals.
 *
 * @template Init
 * @template [ValType=Init]
 */
export class BaseSignal {
	/**
	 * @type {unknown}
	 * @internal
	 */
	static fn

	/**
	 * @type {(v?: ValType) => ValType}
	 * @internal
	 */
	__

	/** @param {Init} v */
	constructor(v) {
		// @ts-expect-error
		this.__ = this.constructor.fn(v)
	}

	/** @internal */
	get [Symbol.toStringTag]() {
		return this.constructor.name
	}

	/** @internal */
	get _() {
		return this.__()
	}

	get value() {
		return this._
	}

	valueOf() {
		return this._
	}
}
