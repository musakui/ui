import { getHandler } from './bind.js'
import { parseTemplate } from './parse.js'
import { replaceChildren } from '#/util/dom.js'
import { isArray } from '#/util/type.js'

/** @typedef {'html' | 'svg' | 'mathml'} TemplateType */

/**
 * @template {TemplateType} T
 * @typedef {T extends 'html' ? HTMLElement : T extends 'svg' ? SVGElement : MathMLElement} TagElement
 */

/** @param {unknown} v */
let toValue = (v) => v

const UNSET = Symbol('unset')

/**
 * A fragment from a tagged template.
 *
 * @template {TemplateType} T template type
 */
export class TemplateFragment extends DocumentFragment {
	/** @type {T} */
	#type

	/** @type {TemplateStringsArray} */
	#strs

	/** @type {unknown[]} */
	#vals

	/** @type {unknown[]} */
	#live

	/** @type {unknown[] | undefined} */
	#pending

	/** @type {((v: unknown) => void)[] | null | undefined} */
	#handlers

	/** @type {Element | undefined} */
	#el

	/**
	 * @param {T} type
	 * @param {TemplateStringsArray} strs
	 * @param {...unknown} vals
	 */
	constructor(type, strs, ...vals) {
		super()
		this.#type = type
		this.#strs = strs
		this.#vals = vals
	}

	/** The root element (only if the template has a single root element). */
	get el() {
		return /** @type {TagElement<T> | undefined} */ (this.#el)
	}

	cloneNode() {
		return new TemplateFragment(this.#type, this.#strs, ...this.#vals)
	}

	/**
	 * Parse and initialise a template fragment.
	 */
	init() {
		if (this.#handlers !== undefined) return this

		const t = parseTemplate(this.#strs, this.#type)
		this.#handlers = t[1]?.map(getHandler) ?? null
		replaceChildren(this, t[0])

		const { firstElementChild: c, firstChild, lastChild } = this
		if (c && c === firstChild && c === lastChild) {
			this.#el = c
		}

		this.#live = this.#vals.map(() => UNSET)

		return this
	}

	/**
	 * Stage a value for a part.
	 *
	 * @param {number} partIndex
	 * @param {unknown} value
	 */
	update(partIndex, value) {
		this.#vals[partIndex] = value
	}

	/**
	 * Read all staged part values into a pending snapshot.
	 *
	 * Call this to track reactive dependencies while reading values,
	 * which can then be committed later (potentially batched).
	 */
	snapshot() {
		if (!this.#handlers) return
		const pending = this.#vals.map(toValue)
		snapshot(pending)
		this.#pending = pending
	}

	/**
	 * Commit all the values to the template.
	 */
	commit() {
		if (!this.#handlers) return
		const live = this.#live
		const pend = this.#pending

		for (const [i, handler] of this.#handlers.entries()) {
			const val = pend ? pend[i] : toValue(this.#vals[i])
			commit(val)

			if (live[i] === val) continue

			handler(val)
			live[i] = val
		}

		this.#pending = undefined
	}
}

/**
 * @param {unknown} v
 * @returns {v is TemplateFragment<any>}
 */
export const isTemplateFragment = (v) => v instanceof TemplateFragment

/** @param {typeof toValue} fn */
export function setToValue(fn) {
	toValue = fn
}

/** @param {unknown} val */
function commit(val) {
	if (isArray(val)) {
		for (const v of val) commit(v)
	} else if (isTemplateFragment(val)) {
		val.init().commit()
	}
}

/** @param {unknown} val */
function snapshot(val) {
	if (isArray(val)) {
		for (const v of val) snapshot(v)
	} else if (isTemplateFragment(val)) {
		val.init().snapshot()
	}
}
