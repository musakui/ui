import { bindValue } from './bind.js'
import { parseTemplate } from './parse.js'
import { replaceChildren } from '#/util/dom.js'

/** @typedef {'html' | 'svg' | 'mathml'} TemplateType */

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

	/** @type {import('./types').TemplateBinding[] | undefined} */
	#bindings

	/** @type {((v: unknown) => void)[] | undefined} */
	#handlers

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

	cloneNode() {
		return new TemplateFragment(this.#type, this.#strs, ...this.#vals)
	}

	/**
	 * Parse a template fragment and bind its values.
	 *
	 * Returns the element if there is a single root element.
	 */
	init() {
		const t = parseTemplate(this.#strs, this.#type)
		this.#bindings = t[1]
		this.bind()
		replaceChildren(this, t[0])

		const { firstElementChild: c, firstChild, lastChild } = this
		if (c && c === firstChild && c === lastChild) return c
	}

	bind() {
		this.#handlers = this.#bindings?.map((b, i) => bindValue(b, this.#vals[i]))
	}

	/**
	 * Manually update a binding with a new value.
	 *
	 * @param {number} i index of original binding
	 * @param {unknown} v new value
	 */
	update(i, v) {
		this.#handlers?.[i]?.(v)
	}
}

/**
 * @param {unknown} v
 * @returns {v is TemplateFragment<any>}
 */
export const isTemplateFragment = (v) => v instanceof TemplateFragment

/**
 * @param {unknown} v
 */
export const initIfTemplate = (v) => (isTemplateFragment(v) ? v.init() : undefined)
