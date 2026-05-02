/** @param {unknown} v */
export const isNullish = (v) => v == null

/** @param {unknown} v */
export const isStr = (v) => typeof v === 'string'

/** @param {unknown} v */
export const isNum = (v) => typeof v === 'number'

/**
 * @param {unknown} v
 * @returns {v is unknown[]}
 */
export const isArray = (v) => Array.isArray(v)

/**
 * @param {unknown} v
 * @returns {v is Record<string, unknown>}
 */
export const isObject = (v) => !!v && typeof v === 'object' && !isArray(v)

/**
 * @param {unknown} v
 * @returns {v is Function}
 */
export const isFunction = (v) => typeof v === 'function'
