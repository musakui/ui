import { effect } from 'alien-signals'
import { upgradeHandlers } from './upgrade.js'
upgradeHandlers()

export * from './signal/index.js'
export { html } from './tag/html.js'

/** @typedef {import('./tag/templateFragment').TemplateFragment<'html'>} HtmlFragment */

/**
 * @param {() => HtmlFragment} fn
 * @param {HTMLElement} target
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
