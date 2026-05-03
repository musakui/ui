import { describe, it, expect, vi } from 'vitest'
import { effect } from 'alien-signals'
import { html, signal, computed } from '#/index.js'

describe('reactive rendering', () => {
	it('should re-render text content', () => {
		const count = signal(1)
		const frag = html`<div>${count}</div>`.init()
		const stop = effect(() => frag.commit())
		expect(frag.el.textContent).toBe('1')
		count.value = 2
		expect(frag.el.textContent).toBe('2')
		stop()
	})

	it('should set attributes', () => {
		const title = signal('test')
		const frag = html`<div title=${title}></div>`.init()
		const stop = effect(() => frag.commit())
		expect(frag.el.title).toBe('test')
		title.value = 'updated'
		expect(frag.el.title).toBe('updated')
		stop()
	})

	it('should set properties', () => {
		const val = signal('foo')
		const frag = html`<input .value=${val} />`.init()
		const stop = effect(() => frag.commit())
		expect(frag.el.value).toBe('foo')
		val.value = 'bar'
		expect(frag.el.value).toBe('bar')
		stop()
	})

	it('should toggle boolean attributes', () => {
		const disabled = signal(true)
		const frag = html`<button ?disabled=${disabled}></button>`.init()
		const stop = effect(() => frag.commit())
		expect(frag.el.hasAttribute('disabled')).toBe(true)
		disabled.value = false
		expect(frag.el.hasAttribute('disabled')).toBe(false)
		stop()
	})

	it('should bind event listeners', () => {
		const count = signal(0)
		const frag = html`<button @click=${() => ++count.value}></button>`.init()
		const stop = effect(() => frag.commit())
		frag.el.click()
		expect(count.value).toBe(1)
		frag.el.click()
		expect(count.value).toBe(2)
		stop()
	})

	it('should replace event listener on update', () => {
		const spy1 = vi.fn()
		const spy2 = vi.fn()
		const handler = signal(spy1)
		const frag = html`<button @click=${handler}></button>`.init()
		const stop = effect(() => frag.commit())
		frag.el.click()
		expect(spy1).toHaveBeenCalledTimes(1)
		handler.value = spy2
		frag.el.click()
		expect(spy1).toHaveBeenCalledTimes(1)
		expect(spy2).toHaveBeenCalledTimes(1)
		stop()
	})

	it('should remove event listener when updated to null', () => {
		const spy = vi.fn()
		const handler = signal(spy)
		const frag = html`<button @click=${handler}></button>`.init()
		const stop = effect(() => frag.commit())
		handler.value = null
		frag.el.click()
		expect(spy).not.toHaveBeenCalled()
		stop()
	})

	it('should remove attribute when signal becomes null', () => {
		const title = signal('hello')
		const frag = html`<div title=${title}></div>`.init()
		const stop = effect(() => frag.commit())
		expect(frag.el.hasAttribute('title')).toBe(true)
		title.value = null
		expect(frag.el.hasAttribute('title')).toBe(false)
		stop()
	})

	it('should toggle boolean attribute from false to true', () => {
		const active = signal(false)
		const frag = html`<div ?data-active=${active}></div>`.init()
		const stop = effect(() => frag.commit())
		expect(frag.el.hasAttribute('data-active')).toBe(false)
		active.value = true
		expect(frag.el.hasAttribute('data-active')).toBe(true)
		stop()
	})

	it('should bind event listener with [fn, options] array form', () => {
		const spy = vi.fn()
		const handler = signal([spy, {}])
		const frag = html`<button @click=${handler}></button>`.init()
		const stop = effect(() => frag.commit())
		frag.el.click()
		expect(spy).toHaveBeenCalledTimes(1)
		stop()
	})

	it('should bind EventListenerObject', () => {
		const spy = vi.fn()
		const listener = { handleEvent: spy }
		const handler = signal(listener)
		const frag = html`<button @click=${handler}></button>`.init()
		const stop = effect(() => frag.commit())
		frag.el.click()
		expect(spy).toHaveBeenCalledTimes(1)
		handler.value = null
		frag.el.click()
		expect(spy).toHaveBeenCalledTimes(1)
		stop()
	})

	it('should swap between different conditional fragments', () => {
		const show = signal(true)
		const frag = html`<div>${computed(() =>
			show.value ? html`<span>yes</span>` : html`<em>no</em>`
		)}</div>`.init()
		const stop = effect(() => frag.commit())
		expect(frag.el.querySelector('span')).toBeTruthy()
		expect(frag.el.querySelector('em')).toBeNull()
		show.value = false
		expect(frag.el.querySelector('span')).toBeNull()
		expect(frag.el.querySelector('em')).toBeTruthy()
		stop()
	})

	it('should handle computed content list', () => {
		const list = signal(['foo', 'bar'])
		// prettier-ignore
		const frag = html`<div>${computed(() => {
			if (!list.value.length) return html`<div>no items</div>`
			return list.value.map((v) => html`<div>${v}</div>`)
		})}</div>`.init()
		const stop = effect(() => frag.commit())
		expect(frag.el.textContent).toBe('foobar')
		list.value = ['foo', 'baz', 'bar']
		expect(frag.el.textContent).toBe('foobazbar')
		list.value = []
		expect(frag.el.textContent).toBe('no items')
		stop()
	})
})
