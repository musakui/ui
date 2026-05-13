/** @import { Rec, ElementOptions, AttrChangedCallback, CustElement } from './types' */

/**
 * @template {Rec} [S=Rec]
 * @param {string} name
 * @param {ElementOptions<S>} [opts]
 */
export function defineElement(name, opts) {
	const connected = opts?.connected ?? NO_OP
	const moved = opts?.moved ?? NO_OP
	const updated = opts?.updated ?? NO_OP
	const disconnected = opts?.disconnected ?? NO_OP

	customElements.define(
		name,
		/** @extends {CustElement<S>} */
		class extends HTMLElement {
			/** @type {S} */
			#state

			/** @type {ChildNode[] | undefined} */
			#childNodes

			/** @type {() => void} */
			#connected

			/** @type {() => void} */
			#moved

			/** @type {AttrChangedCallback} */
			#updated

			/** @type {() => void} */
			#disconnected

			static {
				opts?.static?.(this)
			}

			constructor() {
				super()
				this.#connected = connected.bind(this)
				this.#moved = moved.bind(this)
				this.#updated = updated.bind(this)
				this.#disconnected = disconnected.bind(this)
				this.#state = /** @type {S}*/ (opts?.state?.call(this) ?? {})
			}

			get children() {
				return this.#childNodes ?? []
			}

			get attrs() {
				return attrObj(this.attributes)
			}

			get state() {
				return this.#state
			}

			connectedCallback() {
				// only populate on the first connect
				this.#childNodes ??= [...this.childNodes]
				this.#connected()
			}

			connectedMoveCallback() {
				this.#moved()
			}

			/** @type {AttrChangedCallback} */
			attributeChangedCallback(name, oldVal, newVal) {
				this.#updated(name, oldVal, newVal)
			}

			disconnectedCallback() {
				this.#disconnected()
			}
		}
	)
}

/** @param {NamedNodeMap} attributes */
function attrObj(attributes) {
	return Object.fromEntries([...attributes].map((a) => [a.name, a.value]))
}

function NO_OP() {}
