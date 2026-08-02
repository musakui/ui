import { getHandler } from './bind.js'
import { parseTemplate, NO_OP } from './parse.js'
import { replaceChildren } from '#/util/dom.js'
import { isArray } from '#/util/type.js'

/** @typedef {'html' | 'svg' | 'mathml'} TemplateType */
/** @typedef {TemplateFragment<TemplateType>} AnyTemplate */

/**
 * @template {TemplateType} T
 * @typedef {T extends 'html' ? HTMLElement : T extends 'svg' ? SVGElement : MathMLElement} TagElement
 */

/** @param {unknown} v */
let toValue = (v) => v

const UNSET = Symbol('unset')

/**
 * lookup the template for an element
 *
 * @type {WeakMap<Element, AnyTemplate>}
 */
const templateMap = new WeakMap()

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
	#live = []

	/** @type {unknown[] | undefined} */
	#pending

	/** @type {((v: unknown) => void)[] | null | undefined} */
	#handlers

	/** @type {Element | undefined} */
	#el

	/** @type {ChildNode | null | undefined} */
	#firstChild

	/** @type {(() => void) | null} */
	#dispose = null

	/**
	 * @internal
	 * @param {AnyTemplate} t
	 */
	static #callDisconnect = (t) => t.#disconnect()

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

	get isConnected() {
		return !!this.#firstChild?.isConnected
	}

	cloneNode() {
		return new TemplateFragment(this.#type, this.#strs, ...this.#vals)
	}

	/**
	 * Parse and initialise a template fragment.
	 *
	 * This is already called on nested templates and on mount,
	 * so there is usually no need to call this in normal apps.
	 */
	init() {
		if (this.#handlers !== undefined) return this

		const t = parseTemplate(this.#strs, this.#type)
		this.#handlers = t[1]?.map(getHandler) ?? null
		replaceChildren(this, t[0])

		const { firstElementChild: c, firstChild, lastChild } = this
		if (c && c === firstChild && c === lastChild) {
			this.#el = c
			templateMap.set(c, this)
		}

		this.#firstChild = firstChild
		this.#live = this.#vals.map(() => UNSET)

		return this
	}

	/**
	 * Stage a value for a part.
	 *
	 * @param {number} partIndex index of the hole in the template string
	 * @param {unknown} value new value to be staged
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
	snapshot(single = false) {
		if (!this.#handlers) return false
		const pending = this.#vals.map(toValue)
		if (!single) walk(pending, snapshot)
		this.#pending = pending
		return true
	}

	/**
	 * Commit all the values to the template.
	 *
	 * @param {(t: AnyTemplate) => void} [afterInsert]
	 */
	commit(afterInsert) {
		if (!this.#handlers) return
		const live = this.#live
		const pend = this.#pending

		for (let i = 0; i < live.length; ++i) {
			const val = pend ? pend[i] : toValue(this.#vals[i])
			if (!afterInsert) walk(val, commit)

			if (live[i] === val) continue
			if (afterInsert) walk(val, NO_OP) // init (already called by getFrag)

			const prev = live[i]
			this.#handlers[i](val)
			live[i] = val
			walk(prev, TemplateFragment.#callDisconnect)
			if (afterInsert) walk(val, afterInsert)
		}

		this.#pending = undefined
	}

	/** @param {() => void} fn */
	setDispose(fn) {
		this.#dispose = fn
		return fn
	}

	#disconnect() {
		const dispose = this.#dispose
		this.#dispose = null
		try {
			dispose?.()
		} catch {
			// eat error
		}
		if (!this.#handlers || this.isConnected) return
		const live = this.#live
		for (let i = 0; i < live.length; ++i) {
			walk(live[i], TemplateFragment.#callDisconnect)
			this.#handlers[i](null)
			live[i] = UNSET
		}
	}
}

/**
 * @param {unknown} v
 * @returns {v is AnyTemplate}
 */
export const isTemplateFragment = (v) => v instanceof TemplateFragment

/** @param {typeof toValue} fn */
export function setToValue(fn) {
	toValue = fn
}

/** @param {AnyTemplate} val */
function commit(val) {
	val.commit()
}

/** @param {AnyTemplate} val */
function snapshot(val) {
	val.snapshot()
}

/**
 * @param {unknown} val
 * @param {(t: AnyTemplate) => void} fn
 */
function walk(val, fn) {
	if (isArray(val)) {
		for (const v of val) walk(v, fn)
	} else {
		const frag = getFrag(val)
		if (frag) fn(frag)
	}
}

/** @param {unknown} val */
function getFrag(val) {
	if (isTemplateFragment(val)) return val.init()
	if (val instanceof Element) return templateMap.get(val)
}
