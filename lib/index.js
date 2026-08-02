import { bindEffect } from './util/scheduler.js'
import { upgradeHandlers } from './upgrade.js'
upgradeHandlers()

export * from './signal/index.js'
export { html } from './tag/html.js'

/** @typedef {import('./tag').HtmlFragment} HtmlFragment */

/**
 * Mount an app to a target element.
 *
 * @param {() => HtmlFragment} fn app factory function
 * @param {HTMLElement | null} target element to mount on
 */
export function mount(fn, target) {
	if (!target) throw new Error('no target')
	const frag = fn()
	target.replaceChildren(frag.init())
	return bindEffect(frag)
}
