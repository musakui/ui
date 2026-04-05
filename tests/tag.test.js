import { describe, it, expect, vi } from 'vitest'
import { html } from '#/tag/html.js'

describe('html template tag', () => {
	it('should render simple html', () => {
		const div = html`<div>hello<span>world</span></div>`.init()
		expect(div.outerHTML).toBe('<div>hello<span>world</span></div>')
	})

	it('should bind attributes', () => {
		const frag = html`<div title=${'foo'}></div>`
		const div = frag.init()
		expect(div.hasAttribute('title')).toBe(true)
		expect(div.title).toBe('foo')
		frag.update(0, 'bar')
		expect(div.title).toBe('bar')
		frag.update(0, null)
		expect(div.hasAttribute('title')).toBe(false)
	})

	it('should render content', () => {
		const frag = html`<div>${'hello world'}</div>`
		const div = frag.init()
		expect(div.textContent).toBe('hello world')
		frag.update(0, 'foo bar')
		expect(div.textContent).toBe('foo bar')
	})

	it('should render content (stringified)', () => {
		const date = new Date()
		const frag = html`<div>${date}</div>`
		const div = frag.init()
		expect(div.textContent).toBe(date.toString())
		frag.update(0, 0)
		expect(div.textContent).toBe('0')
	})

	it('should render content (array)', () => {
		const frag = html`<div>${['foo', 'bar', 'baz']}</div>`
		const div = frag.init()
		expect(div.textContent).toBe(`foobarbaz`)
		frag.update(0, [1, ' foo ', 2, 'bar'])
		expect(div.textContent).toBe(`1 foo 2bar`)
	})

	it('should render content (nested)', () => {
		const frag = html`<div>foo ${html`<span>bar</span>`}</div>`
		const div = frag.init()
		expect(div.textContent).toBe(`foo bar`)
		frag.update(0, html`<span>baz</span>`)
		expect(div.textContent).toBe(`foo baz`)
	})

	it('should render content (empty)', () => {
		const frag = html`<div>${null}</div>`
		const div = frag.init()
		expect(div.textContent).toBe('')
		frag.update(0, [])
		expect(div.textContent).toBe('')
	})

	it('should handle raw binding', () => {
		const cleanup = vi.fn()
		const spy = vi.fn((el) => {
			el.dataset.foo = 'bar'
			return cleanup
		})
		const frag = html`<div ${spy}>hello</div>`
		const div = frag.init()
		expect(spy).toHaveBeenCalledWith(div)
		expect(div.getAttribute('data-foo')).toBe('bar')
		frag.update(0, null)
		expect(cleanup).toHaveBeenCalled()
	})

	it('should bind multiple attributes on same element', () => {
		const frag = html`<div id=${'foo'} title=${'bar'}></div>`
		const div = frag.init()
		expect(div.id).toBe('foo')
		expect(div.title).toBe('bar')
		frag.update(0, 'baz')
		expect(div.id).toBe('baz')
		frag.update(1, 'qux')
		expect(div.title).toBe('qux')
	})

	it('should render multiple content holes', () => {
		const frag = html`<div>${'hello'} ${'world'}</div>`
		const div = frag.init()
		expect(div.textContent).toBe('hello world')
		frag.update(0, 'foo')
		expect(div.textContent).toBe('foo world')
		frag.update(1, 'bar')
		expect(div.textContent).toBe('foo bar')
	})

	it('should render adjacent content holes', () => {
		const frag = html`<div>${'a'}${'b'}</div>`
		const div = frag.init()
		expect(div.textContent).toBe('ab')
		frag.update(0, 'x')
		expect(div.textContent).toBe('xb')
		frag.update(1, 'y')
		expect(div.textContent).toBe('xy')
	})

	it('should render top-level content holes', () => {
		const frag = html`${'before'}<span>mid</span>${'after'}`
		frag.init()
		expect(frag.textContent).toBe('beforemidafter')
		frag.update(0, 'x')
		expect(frag.textContent).toBe('xmidafter')
		frag.update(1, 'y')
		expect(frag.textContent).toBe('xmidy')
	})

	it('should handle mixed attribute and content bindings', () => {
		const frag = html`<div class=${'a'}>${'hello'}</div>`
		const div = frag.init()
		expect(div.className).toBe('a')
		expect(div.textContent).toBe('hello')
		frag.update(0, 'b')
		frag.update(1, 'world')
		expect(div.className).toBe('b')
		expect(div.textContent).toBe('world')
	})

	it('should produce independent clones', () => {
		const frag = html`<div>${'original'}</div>`
		const clone = frag.cloneNode()
		const el1 = frag.init()
		const el2 = clone.init()
		expect(el1.textContent).toBe('original')
		expect(el2.textContent).toBe('original')
		frag.update(0, 'updated')
		expect(el1.textContent).toBe('updated')
		expect(el2.textContent).toBe('original')
	})

	it('should support multiple instances from same template strings', () => {
		const make = (text) => html`<span>${text}</span>`
		const el1 = make('foo').init()
		const el2 = make('bar').init()
		expect(el1.textContent).toBe('foo')
		expect(el2.textContent).toBe('bar')
	})
})
