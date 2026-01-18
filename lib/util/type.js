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
