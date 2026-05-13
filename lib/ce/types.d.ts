export type Rec<T = unknown> = Record<string, T>

export interface CustElement<S extends Rec> extends HTMLElement {
	/** element state */
	readonly state: S

	/** element attributes */
	readonly attrs: Rec<string>

	/** initial child nodes */
	readonly children: ChildNode[]
}

export type AttrChangedCallback<T extends HTMLElement = HTMLElement> = (
	this: T,
	name: string,
	oldVal: string | null,
	newVal: string | null
) => void

export type ElementOptions<S extends Rec> = {
	/**
	 * static initialization
	 */
	static?: (cls: typeof HTMLElement) => void

	/**
	 * element initial state
	 */
	state?: (this: HTMLElement) => S

	/**
	 * called when the element is attached to the document
	 */
	connected?: (this: CustElement<S>) => void

	/**
	 * called when the element is moved (e.g. via `.moveBefore()`)
	 */
	moved?: (this: CustElement<S>) => void

	/**
	 * called when attributes are changed on the element
	 */
	updated?: AttrChangedCallback<CustElement<T>>

	/**
	 * called when the element is removed from the document
	 */
	disconnected?: (this: CustElement<S>) => void
}
