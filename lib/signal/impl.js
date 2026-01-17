import { signal, computed } from 'alien-signals'
import { BaseSignal } from './base.js'

/**
 * @template T
 * @extends {BaseSignal<T>}
 */
export class Signal extends BaseSignal {
	static {
		this.fn = signal
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
		this.fn = computed
	}
}
