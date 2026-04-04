import type { PersistentFragment } from '#/util/persistentFragment'

type RawBind = readonly [t: 'r', el: Element]
type AttrBind = readonly [t: 'a', el: Element, n: string]
type ContentBind = readonly [t: 'c', el: PersistentFragment]

export type TemplateBinding = AttrBind | RawBind | ContentBind

type CachedBind = readonly [path: number[], type: 'r' | 'a' | 'c', name?: string]

export type BoundTemplate = readonly [frag: DocumentFragment, binds?: CachedBind[]]
