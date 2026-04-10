import { registerEffect } from '#/index.js'

/** @import { Signal } from '#/signal/impl.js' */
/** @import { HtmlFragment } from '#/index.js' */
/** @typedef {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} HtmlInputs */

/**
 * @template {HTMLElement} Element
 * @template {Event} Evt
 * @param {Element} el
 * @param {() => void} effectFn
 * @param {string} eventName
 * @param {(this: Element, evt: Evt) => void} handler
 */
function rawModel(el, effectFn, eventName, handler) {
	el.addEventListener(eventName, handler)
	registerEffect(el, effectFn)
}

/**
 * @template [T=string]
 * @param {Signal<T>} sig
 * @param {(el: HtmlInputs) => T} [getValue]
 */
export function model(sig, getValue) {
	const setVal = getValue
		? /** @this {HtmlInputs} */
			function () {
				sig.value = getValue(this)
			}
		: /** @this {HtmlInputs} */
			function () {
				sig.value = this.value
			}

	/** @param {HtmlInputs} el */
	return (el) => {
		const fn = () => (el.value = sig.value)
		rawModel(el, fn, 'input', setVal)
	}
}

/** @param {Signal<boolean>} sig */
export function checkModel(sig) {
	/** @param {HTMLInputElement} el */
	return (el) => {
		const fn = () => (el.checked = sig.value)
		rawModel(el, fn, 'change', function () {
			sig.value = this.checked
		})
	}
}

/**
 * @template {WeakKey} T
 * @param {(v: T) => HtmlFragment} fn
 */
export function cached(fn) {
	/** @type {WeakMap<T, Element>} */
	const cache = new WeakMap()

	/** @param {T} val */
	return (val) => {
		const found = cache.get(val)
		if (found) return found
		const el = fn(val).init()
		if (!el) throw new Error('invalid template')
		cache.set(val, el)
		return el
	}
}

/**
 * @template [T=string]
 * @param {Signal<T>} sig
 * @param {T} [value]
 */
export function radioModel(sig, value) {
	/** @param {HTMLInputElement} el */
	return (el) => {
		const fn = () => {
			el.checked = sig.value === (value ?? el.value)
		}
		rawModel(el, fn, 'change', function () {
			if (this.checked) {
				sig.value = value ?? this.value
			}
		})
	}
}

/** @param {Signal<number>} sig */
export function numModel(sig) {
	return model(sig, (el) => Number(el.value))
}

export const input =
	'block w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

/**
 * Raw binding that positions a popover below its anchor element on open.
 * @param {string} anchorId
 * @param {{ matchWidth?: boolean }} [opts]
 */
export function popoverAnchor(anchorId, opts) {
	/** @param {HTMLElement} el */
	return (el) => {
		el.addEventListener('beforetoggle', (evt) => {
			if (evt.newState !== 'open') return
			const anchor = document.getElementById(anchorId)
			if (!anchor) return
			const r = anchor.getBoundingClientRect()
			el.style.top = `${r.bottom + 4}px`
			el.style.left = `${r.left}px`
			if (opts?.matchWidth) el.style.width = `${r.width}px`
		})
	}
}

export const btn = (variant = 'default', size = '') => {
	const base =
		'inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium cursor-pointer border border-transparent leading-tight disabled:opacity-50 disabled:pointer-events-none'
	const v =
		{
			default: 'bg-muted text-foreground',
			primary: 'bg-accent text-accent-foreground',
			destructive: 'bg-destructive text-destructive-foreground',
			ghost: 'bg-transparent text-foreground',
			outline: 'text-foreground',
			link: 'bg-transparent text-foreground underline p-0',
		}[variant] ?? ''
	const s =
		variant === 'link'
			? ''
			: ({ sm: 'px-2.5 py-1 text-xs', lg: 'px-6 py-3 text-base' }[size] ?? 'px-4 py-2')
	return `${base} ${v} ${s}`.trim()
}
