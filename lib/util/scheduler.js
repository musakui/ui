import { effect, setActiveSub } from 'alien-signals'

/** @import { AnyTemplate } from '#/tag/templateFragment.js' */

let flushing = false

/** @type {Set<AnyTemplate>} */
const pending = new Set()

/**
 * Create reactive effect for a template fragment
 *
 * @param {AnyTemplate} frag
 */
export function bindEffect(frag) {
	const saved = setActiveSub()
	try {
		const dispose = effect(() => {
			if (!frag.snapshot(true)) return
			pending.add(frag)
			if (flushing || pending.size > 1) return
			queueMicrotask(flush)
		})
		return frag.setDispose(() => {
			dispose()
			pending.delete(frag)
		})
	} finally {
		setActiveSub(saved)
	}
}

function flush() {
	flushing = true
	try {
		for (const frag of pending) {
			pending.delete(frag)
			frag.commit(bindEffect)
		}
	} finally {
		flushing = false
	}
}
