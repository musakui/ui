/** @param {string} s */
export const createComment = (s) => document.createComment(s)

/** @type {typeof document.createElement} */
export const createElement = (s) => document.createElement(s)

/**
 * @param {Node} n
 * @returns {n is Text}
 */
export const isTextNode = (n) => n.nodeType === /* Node.TEXT_NODE */ 3

/**
 * Get the previous sibling of a node
 *
 * @param {Node} node the reference node
 */
export const prevSibling = (node) => node.previousSibling

/**
 * Get the next sibling of a node
 *
 * @param {Node} node the reference node
 */
export const nextSibling = (node) => node.nextSibling

/**
 * Replaces node with nodes, while replacing strings in nodes with equivalent Text nodes.
 *
 * @param {ChildNode} node the node to be replaced
 * @param {...(string | Node)} nodes the new nodes/strings to insert
 */
export const replaceWith = (node, ...nodes) => node.replaceWith(...nodes)

/**
 * Replace all children of node with nodes, while replacing strings in nodes with equivalent Text nodes.
 *
 * @param {ParentNode} node the parent node
 * @param {...(string | Node)} nodes the new children nodes/strings
 */
export const replaceChildren = (node, ...nodes) => node.replaceChildren(...nodes)

/**
 * Set an attribute on an element, or remove with `null`.
 *
 * @param {Element} el
 * @param {string} name
 * @param {string | null} value
 */
export const setAttribute = (el, name, value) => {
	if (value === null) {
		el.removeAttribute(name)
	} else {
		el.setAttribute(name, value)
	}
}

/**
 * Iterate over nodes in a subtree.
 *
 * @param {Node} root the root node to start traversal
 * @param {number} [whatToShow] NodeFilter bitmask
 */
export function* nodeIterator(root, whatToShow) {
	const iter = document.createNodeIterator(root, whatToShow)
	let node
	while ((node = iter.nextNode())) yield /** @type {ChildNode} */ (node)
}

/**
 * Splice nodes between two marker nodes.
 *
 * @param {ParentNode} parent parent node of `a` and `b`
 * @param {Node} a start marker
 * @param {Node} b end marker
 * @param {...(string | Node)} nodes nodes/strings to insert between `a` and `b`
 */
export function* splice(parent, a, b, ...nodes) {
	let s = 2
	for (const n of parent.childNodes) {
		if (n === b) {
			yield* nodes
			s = 1
		}
		if (s) {
			yield n
			if (n === a) {
				s = 0
			}
		}
	}
}
