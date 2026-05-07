import { isNullish } from './type.js'

/** @typedef {number[]} NodePath */

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
 * @param {Node} n
 * @returns {n is Element}
 */
export const isElNode = (n) => n.nodeType === /* Node.ELEMENT_NODE */ 1

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
 * @param {...unknown} nodes the new children nodes/strings
 */
export const replaceChildren = (node, ...nodes) => node.replaceChildren(...nodes)

/**
 * attempt moveBefore but fallback to insertBefore
 */
export const safeMoveBefore =
	'moveBefore' in Element.prototype
		? /**
			 * @template {Node} T
			 * @param {ParentNode} parent
			 * @param {T} node
			 * @param {ChildNode | null} ref
			 */
			(parent, node, ref) => {
				if (parent.isConnected && isElNode(node) && node.isConnected) {
					parent.moveBefore(node, ref)
					return node
				} else {
					return parent.insertBefore(node, ref)
				}
			}
		: /**
			 * @template {Node} T
			 * @param {ParentNode} parent
			 * @param {T} node
			 * @param {ChildNode | null} ref
			 */
			(parent, node, ref) => parent.insertBefore(node, ref)

/**
 * @param {ChildNode | null} cur
 * @param {Node} end
 */
export function removeFrom(cur, end) {
	while (cur && cur !== end) {
		const ns = cur.nextSibling
		cur.remove()
		cur = ns
	}
}

/**
 * Set an attribute on an element, or remove with `null`/`undefined`.
 *
 * @param {Element} el
 * @param {string} name
 * @param {unknown} value
 */
export const setAttribute = (el, name, value) => {
	if (isNullish(value)) {
		el.removeAttribute(name)
	} else {
		el.setAttribute(name, /** @type {string} */ (value))
	}
}

/**
 * Get the index-based path to a node.
 *
 * @param {Node} root
 * @param {Node} target
 */
export function computePath(root, target) {
	/** @type {number[]} */
	const indexes = []

	while (target !== root) {
		const parent = target.parentNode
		if (!parent) throw new DOMException('node without parent')
		indexes.push(Array.prototype.indexOf.call(parent.childNodes, target))
		target = parent
	}

	return /** @type {NodePath} */ (indexes.reverse())
}

/**
 * Traverse a node path.
 *
 * @param {Node} node
 * @param {NodePath} nodePath
 */
export function getNode(node, nodePath) {
	for (const i of nodePath) {
		node = node.childNodes[i]
	}
	return /** @type {ChildNode} */ (node)
}
