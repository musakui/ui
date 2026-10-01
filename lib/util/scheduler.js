import { effect, setActiveSub } from 'alien-signals'
import { recurse } from '#/tag/templateFragment.js'

/** @import { AnyTemplate } from '#/tag/templateFragment.js' */

let flushing = false

/** @type {Set<AnyTemplate>} */
const pending = new Set()

/**
 * Wire reactive effects for a template fragment
 *
 * @param {AnyTemplate} frag
 */
export function bindEffect(frag) {
	const saved = setActiveSub(undefined)
	try {
		frag.init()
		const dispose = effect(() => {
			if (!frag.snapshot(true)) return
			pending.add(frag)
			if (flushing || pending.size > 1) return
			queueMicrotask(flush)
		})
		const stop = () => {
			dispose()
			pending.delete(frag)
		}
		frag.setDispose(stop)
		return stop
	} finally {
		setActiveSub(saved)
	}
}

const bindNested = recurse(bindEffect)

function flush() {
	flushing = true
	while (pending.size) {
		for (const frag of pending) {
			pending.delete(frag)
			frag.commit(bindNested)
			break
		}
	}
	flushing = false
}
