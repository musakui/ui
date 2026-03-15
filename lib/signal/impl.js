import { signal as _sig, computed as _comp } from 'alien-signals'
import { BaseSignal } from './base.js'

/**
 * @template T
 * @extends {BaseSignal<T>}
 */
export class Signal extends BaseSignal {
	static {
		this.fn = _sig
	}

	get value() {
		return this._
	}

	/** @param {T} val */
	set value(val) {
		this.__(val)
	}
}

/**
 * @template T
 * @extends {BaseSignal<() => T, T>}
 */
export class Computed extends BaseSignal {
	static {
		this.fn = _comp
	}
}

/**
 * Create a new signal (reactive state).
 *
 * @template T value type
 * @param {T} init the initial value
 */
export const signal = (init) => new Signal(init)

/**
 * Create a computed value (derived state).
 *
 * @template T value type
 * @param {(previousValue?: T) => T} getter a function to get the value
 */
export const computed = (getter) => new Computed(getter)
