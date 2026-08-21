import {
	isNode,
	isTextNode,
	createComment,
	safeMoveBefore,
	insertBefore,
	removeBetween,
	replaceChildren,
} from './dom.js'

/** @param {unknown} txt */
const createText = (txt) => document.createTextNode(/** @type {string} */ (txt))

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
		this.setNodes(nodes)
	}

	/** @param {unknown[]} nodes */
	setNodes(nodes) {
		const [a, b] = this.#bounds

		// empty fragment
		if (!nodes.length) return clear(a, b)

		const parent = a.parentNode ?? this

		// single incoming
		if (nodes.length === 1) {
			const n = /** @type {string | Node} */ (nodes[0])

			if (isNode(n)) {
				clear(a, b, nodes)
				if (a.nextSibling !== n) safeMoveBefore(parent, n, b)
				return
			}

			const afterA = a.nextSibling

			// something is wrong
			if (!afterA) return

			if (afterA.nextSibling === b && isTextNode(afterA)) {
				// set text content directly
				afterA.data = n
			} else {
				clear(a, b)
				insertBefore(parent, createText(n), b)
			}
			return
		}

		clear(a, b, nodes)

		/** @type {ChildNode | null} */
		let ref = a.nextSibling
		for (const node of nodes) {
			if (!isNode(node)) {
				insertBefore(parent, createText(node), ref)
				continue
			}
			if (ref === node) {
				ref = ref.nextSibling
			} else {
				safeMoveBefore(parent, node, ref)
			}
		}
	}
}

/**
 * @param {Node} a
 * @param {Node} b
 * @param {unknown[]} [keep]
 */
function clear(a, b, keep) {
	if (keep) return removeBetween(a.nextSibling, b, keepNodes(keep))

	const p = a.parentNode
	if (p && p.firstChild === a && p.lastChild === b) {
		replaceChildren(p, a, b)
	} else {
		removeBetween(a.nextSibling, b)
	}
}

/** @param {unknown[]} arr */
function* keepNodes(arr) {
	for (const n of arr) {
		if (isNode(n)) yield n
	}
}
