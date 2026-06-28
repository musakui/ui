import { effect } from 'alien-signals'
import { upgradeHandlers } from './upgrade.js'
upgradeHandlers()

export * from './signal/index.js'
export { html } from './tag/html.js'

/** @typedef {import('./tag').HtmlFragment} HtmlFragment */

/**
 * Mount an app to a target element.
 *
 * @param {() => HtmlFragment} fn app factory function
 * @param {HTMLElement} target element to mount on
 */
export function mount(fn, target) {
	const frag = fn()
	target.replaceChildren(frag.init())

	let pending = false

	return effect(() => {
		frag.snapshot()
		if (pending) return
		pending = true
		queueMicrotask(() => {
			pending = false
			frag.commit()
		})
	})
}
