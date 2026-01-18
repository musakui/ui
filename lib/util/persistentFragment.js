import {
	isTextNode,
	createComment,
	replaceChildren,
	replaceWith,
	siblings,
	splice,
} from './dom.js'

/**
 * `DocumentFragment` that can be updated.
 */
export class PersistentFragment extends DocumentFragment {
	/** @type {[Comment, Comment]} */
	#bounds

	constructor() {
		super()
		const a = createComment(`<>`)
		const b = createComment(`</>`)
		this.append(a, b)
		this.#bounds = [a, b]
	}

	/** @param {...(string | Node)} nodes */
	replaceChildren(...nodes) {
		const [a, b] = this.#bounds
		const [beforeA, afterA] = siblings(a)

		// something is wrong
		if (!afterA) return

		// empty fragment
		if (afterA === b) return a.after(...nodes)

		const bSiblings = siblings(b)

		// single child
		if (afterA === bSiblings[0]) {
			const n = nodes[0]
			if (nodes.length === 1 && isTextNode(afterA) && !(n instanceof Node)) {
				// set text content directly
				afterA.data = n
			} else {
				replaceWith(afterA, ...nodes)
			}
			return
		}

		const parent = a.parentNode ?? this
		if (beforeA || bSiblings[1]) {
			replaceChildren(parent, ...splice(parent, a, b, ...nodes))
		} else {
			// no other children
			replaceChildren(parent, a, ...nodes, b)
		}
	}
}
