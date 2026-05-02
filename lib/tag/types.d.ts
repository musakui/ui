import type { PersistentFragment } from '#/util/persistentFragment.js'
import type { NodePath } from '#/util/dom.js'

type RawPart = readonly [t: 'r', el: Element]
type AttrPart = readonly [t: 'a', el: Element, n: string]
type ContentPart = readonly [t: 'c', el: PersistentFragment]

export type TemplatePart = RawPart | AttrPart | ContentPart

export type WrapFn = (
	str: string,
	tag: string
) => [content: string, unwrap: (frag: DocumentFragment) => void]

export type PartInfo = readonly [path: NodePath, type: 'r' | 'a' | 'c', name?: string]

export type CachedTemplate = readonly [frag: DocumentFragment, parts?: PartInfo[]]

export type BoundTemplate = readonly [frag: DocumentFragment, parts?: TemplatePart[]]

export { NodePath }
