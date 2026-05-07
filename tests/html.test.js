import { describe, it, expect, vi } from 'vitest'
import { html } from '#/tag/html.js'

describe('html template tag', () => {
	it('init is idempotent and returns the fragment', () => {
		const frag = html`<div>${'hello'}</div>`
		expect(frag.init()).toBe(frag)
		expect(frag.init()).toBe(frag)
		frag.commit()
		expect(frag.el.textContent).toBe('hello')
	})

	it('should render simple html', () => {
		const frag = html`<div>hello<span>world</span></div>`.init()
		expect(frag.el.outerHTML).toBe('<div>hello<span>world</span></div>')
	})

	it('should bind attributes', () => {
		const frag = html`<div title=${'foo'}></div>`.init()
		frag.commit()
		expect(frag.el.hasAttribute('title')).toBe(true)
		expect(frag.el.title).toBe('foo')
	})

	it('should render content', () => {
		const frag = html`<div>${'hello world'}</div>`.init()
		frag.commit()
		expect(frag.el.textContent).toBe('hello world')
	})

	it('should render content (stringified)', () => {
		const date = new Date()
		const frag1 = html`<div>${date}</div>`.init()
		frag1.commit()
		expect(frag1.el.textContent).toBe(date.toString())

		// falsy number must not be treated as empty
		const frag2 = html`<div>${0}</div>`.init()
		frag2.commit()
		expect(frag2.el.textContent).toBe('0')
	})

	it('should render content (array)', () => {
		const frag = html`<div>${['foo', 'bar', 'baz']}</div>`.init()
		frag.commit()
		expect(frag.el.textContent).toBe(`foobarbaz`)
	})

	it('should render content (nested)', () => {
		const frag = html`<div>foo ${html`<span>bar</span>`}</div>`.init()
		frag.commit()
		expect(frag.el.textContent).toBe(`foo bar`)
	})

	it('should render content (empty)', () => {
		const nullFrag = html`<div>${null}</div>`.init()
		nullFrag.commit()
		expect(nullFrag.el.textContent).toBe('')

		const arrFrag = html`<div>${[]}</div>`.init()
		arrFrag.commit()
		expect(arrFrag.el.textContent).toBe('')
	})

	it('should handle raw binding', () => {
		const spy = vi.fn((el) => {
			el.dataset.foo = 'bar'
		})
		const frag = html`<div ${spy}>hello</div>`.init()
		frag.commit()
		expect(spy).toHaveBeenCalledWith(frag.el)
		expect(frag.el.getAttribute('data-foo')).toBe('bar')
	})

	it('should bind multiple attributes on same element', () => {
		const frag = html`<div id=${'foo'} title=${'bar'}></div>`.init()
		frag.commit()
		expect(frag.el.id).toBe('foo')
		expect(frag.el.title).toBe('bar')
	})

	it('should render multiple content holes', () => {
		const frag = html`<div>${'hello'} ${'world'}</div>`.init()
		frag.commit()
		expect(frag.el.textContent).toBe('hello world')
	})

	it('should render adjacent content holes', () => {
		const frag = html`<div>${'a'}${'b'}</div>`.init()
		frag.commit()
		expect(frag.el.textContent).toBe('ab')
	})

	it('should render content hole preceded by literal <', () => {
		// literal `<` in surrounding text prevents ONLY_HOLES from matching
		const frag = html`<div>a < b ${'hello'}</div>`.init()
		frag.commit()
		expect(frag.el.textContent).toBe('a < b hello')
	})

	it('should render multiple content holes in text with literal <', () => {
		const frag = html`<div>x < y ${'a'} z ${'b'}</div>`.init()
		frag.commit()
		expect(frag.el.textContent).toBe('x < y a z b')
	})

	it('should render top-level content holes', () => {
		const frag = html`${'before'}<span>mid</span>${'after'}`.init()
		frag.commit()
		expect(frag.textContent).toBe('beforemidafter')
	})

	it('should handle mixed attribute and content bindings', () => {
		const frag = html`<div class=${'a'}>${'hello'}</div>`.init()
		frag.commit()
		expect(frag.el.className).toBe('a')
		expect(frag.el.textContent).toBe('hello')
	})

	it('should produce independent clones', () => {
		const frag = html`<div>${'original'}</div>`
		const clone = frag.cloneNode()
		frag.init()
		clone.init()
		frag.commit()
		clone.commit()
		expect(frag.el.textContent).toBe('original')
		expect(clone.el.textContent).toBe('original')
		frag.update(0, 'updated')
		frag.commit()
		expect(frag.el.textContent).toBe('updated')
		expect(clone.el.textContent).toBe('original')
	})

	it('should support multiple instances from same template strings', () => {
		const make = (text) => html`<span>${text}</span>`
		const frag1 = make('foo').init()
		const frag2 = make('bar').init()
		frag1.commit()
		frag2.commit()
		expect(frag1.el.textContent).toBe('foo')
		expect(frag2.el.textContent).toBe('bar')
	})

	it('el is undefined for multi-root template', () => {
		const frag = html`<span>a</span><span>b</span>`.init()
		expect(frag.el).toBeUndefined()
	})

	it('el is undefined for text-only template', () => {
		const frag = html`just text`.init()
		expect(frag.el).toBeUndefined()
	})

	it('static template with no bindings renders correctly', () => {
		const frag = html`<p>no bindings</p>`.init()
		frag.commit()
		expect(frag.el.outerHTML).toBe('<p>no bindings</p>')
	})

	it('handles boolean attribute alongside dynamic attribute', () => {
		const frag = html`<button disabled title=${'foo'}></button>`.init()
		frag.commit()
		expect(frag.el.hasAttribute('disabled')).toBe(true)
		expect(frag.el.title).toBe('foo')
	})

	it('ignores non-marker comment nodes during parse', () => {
		const frag = html`<div><!-- note -->${'hello'}</div>`.init()
		frag.commit()
		expect(frag.el.textContent).toBe('hello')
	})

	it('undefined content renders as empty', () => {
		const frag = html`<div>${undefined}</div>`.init()
		frag.commit()
		expect(frag.el.textContent).toBe('')
	})

	it('undefined attribute value removes the attribute', () => {
		const frag = html`<div title=${'foo'}></div>`.init()
		frag.commit()
		expect(frag.el.hasAttribute('title')).toBe(true)
		frag.update(0, undefined)
		frag.commit()
		expect(frag.el.hasAttribute('title')).toBe(false)
	})
})

describe('commit behavior', () => {
	it('commit before init is a no-op', () => {
		const frag = html`<div>${'hello'}</div>`
		expect(() => frag.commit()).not.toThrow()
		frag.init()
		frag.commit()
		expect(frag.el.textContent).toBe('hello')
	})

	it('update stages without changing the DOM', () => {
		const frag = html`<div>${'initial'}</div>`.init()
		frag.commit()
		const div = frag.el
		frag.update(0, 'staged')
		expect(div.textContent).toBe('initial')
		frag.commit()
		expect(div.textContent).toBe('staged')
	})

	it('multiple staged updates are applied in one commit', () => {
		const frag = html`<div id=${'a'}>${'x'}</div>`.init()
		frag.commit()
		const div = frag.el
		frag.update(0, 'b')
		frag.update(1, 'y')
		expect(div.id).toBe('a')
		expect(div.textContent).toBe('x')
		frag.commit()
		expect(div.id).toBe('b')
		expect(div.textContent).toBe('y')
	})

	it('updates individual content holes independently', () => {
		const frag = html`<div>${'hello'} ${'world'}</div>`.init()
		frag.commit()
		frag.update(0, 'foo')
		frag.commit()
		expect(frag.el.textContent).toBe('foo world')
		frag.update(1, 'bar')
		frag.commit()
		expect(frag.el.textContent).toBe('foo bar')
	})

	it('replaces a nested fragment with a different instance', () => {
		const frag = html`<div>foo ${html`<span>bar</span>`}</div>`.init()
		frag.commit()
		frag.update(0, html`<span>baz</span>`)
		frag.commit()
		expect(frag.el.textContent).toBe('foo baz')
	})

	it('replaces element node with string', () => {
		const inner = html`<span>hello</span>`.init()
		const frag = html`<div>${inner}</div>`.init()
		frag.commit()
		expect(frag.el.textContent).toBe('hello')
		frag.update(0, 'just text')
		frag.commit()
		expect(frag.el.textContent).toBe('just text')
		expect(frag.el.querySelector('span')).toBeNull()
	})

	it('handles same node committed twice', () => {
		const span = document.createElement('span')
		span.textContent = 'original'
		const frag = html`<div>${[span]}</div>`.init()
		frag.commit()
		expect(frag.el.contains(span)).toBe(true)
		expect(frag.el.textContent).toBe('original')
		frag.update(0, [span])
		frag.commit()
		expect(frag.el.contains(span)).toBe(true)
		expect(frag.el.textContent).toBe('original')
	})

	it('commit propagates to a nested fragment', () => {
		const child = html`<span>${'hello'}</span>`
		const parent = html`<div>${child}</div>`.init()
		parent.commit()
		expect(parent.el.textContent).toBe('hello')
		child.update(0, 'world')
		parent.commit()
		expect(parent.el.textContent).toBe('world')
	})

	it('commit propagates through a deep tree', () => {
		const leaf = html`<em>${'leaf'}</em>`
		const mid = html`<span>${leaf}</span>`
		const root = html`<div>${mid}</div>`.init()
		root.commit()
		expect(root.el.textContent).toBe('leaf')
		leaf.update(0, 'updated')
		root.commit()
		expect(root.el.textContent).toBe('updated')
	})

	it('same-instance nested fragment is not re-inserted on re-commit', () => {
		const child = html`<span>${'hello'}</span>`
		const parent = html`<div>${child}</div>`.init()
		parent.commit()
		const span = parent.el.querySelector('span')
		child.update(0, 'world')
		parent.commit()
		expect(parent.el.querySelector('span')).toBe(span)
		expect(parent.el.textContent).toBe('world')
	})

	it('updates multi-child content hole that has siblings', () => {
		// PF has siblings (<b>) so updates go through the splice path
		const frag = html`${'x'}<b>mid</b>`.init()
		frag.commit()
		expect(frag.textContent).toBe('xmid')
		frag.update(0, ['a', 'b', 'c'])
		frag.commit()
		expect(frag.textContent).toBe('abcmid')
		frag.update(0, ['x', 'y'])
		frag.commit()
		expect(frag.textContent).toBe('xymid')
	})

	it('commit propagates to each fragment in an array', () => {
		const make = (v) => html`<li>${v}</li>`
		// prettier-ignore
		const frag = html`<ul>${['a', 'b', 'c'].map(make)}</ul>`.init()
		frag.commit()
		expect(frag.el.textContent).toBe('abc')
		frag.update(0, ['a', 'B', 'c'].map(make))
		frag.commit()
		expect(frag.el.textContent).toBe('aBc')
	})
})

describe('disconnect behavior', () => {
	it('runs cleanup when replacing a fragment', () => {
		const cleanup = vi.fn()
		const setup = vi.fn((el) => cleanup)
		const child = html`<div ${setup}></div>`.init()
		const parent = html`<div>${child}</div>`.init()
		parent.commit()
		expect(setup).toHaveBeenCalledOnce()

		parent.update(0, null)
		parent.commit()
		expect(cleanup).toHaveBeenCalledOnce()
	})

	it('propagates cleanup to nested fragments', () => {
		const cleanup = vi.fn()
		const setup = vi.fn((el) => cleanup)
		const grandchild = html`<span ${setup}></span>`.init()
		const child = html`<div>${grandchild}</div>`.init()
		const parent = html`<div>${child}</div>`.init()
		parent.commit()
		expect(setup).toHaveBeenCalledOnce()

		parent.update(0, null)
		parent.commit()
		expect(cleanup).toHaveBeenCalledOnce()
	})

	it('runs cleanup returned from raw binding callback', () => {
		const cleanup = vi.fn()
		const frag = html`<div ${() => cleanup}>hello</div>`.init()
		frag.commit()
		frag.update(0, null)
		frag.commit()
		expect(cleanup).toHaveBeenCalledOnce()
	})

	it('handles disconnects for an element array', () => {
		const makeItem = (t) => {
			const cleanup = vi.fn()
			const frag = html`<span ${() => cleanup}>${t}</span>`.init()
			return { el: frag.el, cleanup }
		}

		const [a, b, c] = ['a', 'b', 'c'].map(makeItem)

		const frag = html`<div>${[a.el, b.el, c.el]}</div>`.init()
		document.body.append(frag)

		frag.commit()
		expect(frag.el.textContent).toBe('abc')

		frag.update(0, [c.el, a.el])
		frag.commit()

		expect(frag.el.textContent).toBe('ca')
		expect(b.cleanup).toHaveBeenCalledOnce()
		expect(a.cleanup).not.toHaveBeenCalled()
		expect(c.cleanup).not.toHaveBeenCalled()

		document.body.removeChild(frag.el)
	})
})

describe('snapshot behavior', () => {
	it('snapshot before init is a no-op', () => {
		const frag = html`<div>${'hello'}</div>`
		expect(() => frag.snapshot()).not.toThrow()
		frag.init()
		frag.commit()
		expect(frag.el.textContent).toBe('hello')
	})

	it('commit uses snapshot values, not subsequent updates', () => {
		const frag = html`<div>${'a'}</div>`.init()
		frag.snapshot()
		frag.update(0, 'b')
		frag.commit()
		expect(frag.el.textContent).toBe('a')
	})

	it('pending is cleared after commit; next commit reads live values', () => {
		const frag = html`<div>${'a'}</div>`.init()
		frag.snapshot()
		frag.update(0, 'b')
		frag.commit()
		expect(frag.el.textContent).toBe('a')
		frag.commit()
		expect(frag.el.textContent).toBe('b')
	})

	it('snapshot recurses into nested fragments', () => {
		const child = html`<span>${'hello'}</span>`
		const parent = html`<div>${child}</div>`.init()
		parent.snapshot()
		child.update(0, 'world')
		parent.commit()
		expect(parent.el.textContent).toBe('hello')
	})

	it('snapshot recurses into elements in an array', () => {
		const inner = html`<span>${'hello'}</span>`.init()
		const outer = html`<div>${[inner.el]}</div>`.init()
		outer.commit()
		inner.update(0, 'world')
		outer.snapshot()
		inner.update(0, 'ignored')
		outer.commit()
		expect(outer.el.textContent).toBe('world')
	})
})
