import type { PersistentFragment } from '../util/persistentFragment'

type AttrBind = {
	t: 'a'
	n: string
	el: Element
}

type RawBind = {
	t: 'r'
	el: Element
}

type ContentBind = {
	t: 'c'
	el: PersistentFragment
}

export type TemplateBinding = AttrBind | RawBind | ContentBind

type BindHandler<T extends TemplateBinding> = (b: T) => (v: unknown) => void

export type BindHandlers = {
	r: BindHandler<RawBind>
	a: BindHandler<AttrBind>
	c: BindHandler<ContentBind>
}

type CachedBind = [idx: number, type: 'r'] | [idx: number, type: 'a', name: string]

export type BoundTemplate = readonly [frag: DocumentFragment, binds?: CachedBind[][]]
