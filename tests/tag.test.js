import { describe, it, expect, vi } from 'vitest'
import { html } from '../lib/tag/index.js'

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
})
