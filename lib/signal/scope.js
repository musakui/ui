import { effect, effectScope, getActiveSub, setActiveSub } from 'alien-signals'

const registry = new FinalizationRegistry(/** @param {() => void} c */ (c) => c())

/** @type {ReturnType<typeof getActiveSub>} */
let currentActiveSub = undefined

/**
 * Registers an effect function that will be cleaned up with a DOM node.
 *
 * @param {Node} node
 * @param {() => void} fn
 */
export function registerEffect(node, fn) {
	// use the active scope node (if any)
	const prev = setActiveSub(currentActiveSub)
	const stop = effect(fn)
	setActiveSub(prev)
	registry.register(node, stop, node)
}

/**
 * @param {() => void} fn
 */
export function withEffectScope(fn) {
	const outer = currentActiveSub
	return effectScope(() => {
		currentActiveSub = getActiveSub()
		try {
			fn()
		} finally {
			currentActiveSub = outer
		}
	})
}
