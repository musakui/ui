import { Signal, Computed } from './impl.js'

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

export { isSignal, toValue } from './base.js'
