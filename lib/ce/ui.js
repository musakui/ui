import { defineElement } from './core.js'
import { withEffectScope } from '#/index.js'

/** @import { HtmlFragment } from '#/index.js' */
/** @import { Rec, CustElement, UiElementOpts } from './types' */

/**
 * @template {Rec} [S=Rec]
 * @param {string} name
 * @param {(this: CustElement<S>) => HtmlFragment} render
 * @param {UiElementOpts<S>} [opts]
 */
export function defineUiElement(name, render, opts) {
	defineElement(name, {
		state() {
			return {
				.../** @type {S} */ (opts?.state?.()),
				stop: () => {},
			}
		},
		connected() {
			const frag = render.call(this)
			this.state.stop = withEffectScope(() => frag.init())
			this.replaceChildren(frag)
		},
		disconnected() {
			this.state.stop()
		},
	})
}
