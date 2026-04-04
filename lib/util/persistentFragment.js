import {
	isTextNode,
	createComment,
	replaceChildren,
	replaceWith,
	prevSibling,
	nextSibling,
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
		const nextSiblingA = nextSibling(a)

		// something is wrong
		if (!nextSiblingA) return

		// empty fragment
		if (nextSiblingA === b) return a.after(...nodes)

		// single child
		if (nextSiblingA === prevSibling(b)) {
			const n = nodes[0]
			if (nodes.length === 1 && isTextNode(nextSiblingA) && !(n instanceof Node)) {
				// set text content directly
				nextSiblingA.data = n
			} else {
				replaceWith(nextSiblingA, ...nodes)
			}
			return
		}

		const parent = a.parentNode ?? this
		if (prevSibling(a) || nextSibling(b)) {
			replaceChildren(parent, ...splice(parent, a, b, ...nodes))
		} else {
			// no other children
			replaceChildren(parent, a, ...nodes, b)
		}
	}
}
