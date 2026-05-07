import {
	isTextNode,
	createComment,
	safeMoveBefore,
	replaceWith,
	removeFrom,
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
		const afterA = a.nextSibling

		// something is wrong
		if (!afterA) return

		// empty fragment
		if (!nodes.length) return removeFrom(afterA, b)

		const parent = a.parentNode ?? this

		// single child
		if (afterA === b.previousSibling && nodes.length === 1) {
			const n = nodes[0]

			// same node, skip
			if (afterA === n) return

			if (n instanceof Node) {
				safeMoveBefore(parent, n, b)
				afterA.remove()
			} else if (isTextNode(afterA)) {
				// set text content directly
				afterA.data = n
			} else {
				// replace node with text
				replaceWith(afterA, n)
			}
			return
		}

		// boundary between inserted and stale nodes
		const marker =
			afterA === b
				? null // fragment was empty
				: parent.insertBefore(createComment(''), afterA)

		const ref = marker ?? b

		for (const node of nodes) {
			if (node instanceof Node) {
				safeMoveBefore(parent, node, ref)
				continue
			}
			parent.insertBefore(document.createTextNode(node), ref)
		}

		if (marker) removeFrom(marker, b)
	}
}
