import { describe, it, expect, vi } from 'vitest'
import { html, signal, computed } from '#/index.js'

describe('reactive rendering', () => {
	it('should re-render text content', () => {
		const count = signal(1)
		const div = html`<div>${count}</div>`.init()
		expect(div.textContent).toBe('1')
		count.value = 2
		expect(div.textContent).toBe('2')
	})

	it('should set attributes', () => {
		const title = signal('test')
		const div = html`<div title=${title}></div>`.init()
		expect(div.title).toBe('test')
		title.value = 'updated'
		expect(div.title).toBe('updated')
	})

	it('should set properties', () => {
		const val = signal('foo')
		const inp = html`<input .value=${val} />`.init()
		expect(inp.value).toBe('foo')
		val.value = 'bar'
		expect(inp.value).toBe('bar')
	})

	it('should toggle boolean attributes', () => {
		const disabled = signal(true)
		const btn = html`<button ?disabled=${disabled}></button>`.init()
		expect(btn.hasAttribute('disabled')).toBe(true)
		disabled.value = false
		expect(btn.hasAttribute('disabled')).toBe(false)
	})

	it('should bind event listeners', () => {
		const count = signal(0)
		const btn = html`<button @click=${() => ++count.value}></button>`.init()
		btn.click()
		expect(count.value).toBe(1)
		btn.click()
		expect(count.value).toBe(2)
	})

	it('should replace event listener on update', () => {
		const spy1 = vi.fn()
		const spy2 = vi.fn()
		const frag = html`<button @click=${spy1}></button>`
		const btn = frag.init()
		btn.click()
		expect(spy1).toHaveBeenCalledTimes(1)
		frag.update(0, spy2)
		btn.click()
		expect(spy1).toHaveBeenCalledTimes(1)
		expect(spy2).toHaveBeenCalledTimes(1)
	})

	it('should remove event listener when updated to null', () => {
		const spy = vi.fn()
		const frag = html`<button @click=${spy}></button>`
		const btn = frag.init()
		frag.update(0, null)
		btn.click()
		expect(spy).not.toHaveBeenCalled()
	})

	it('should handle computed content list', () => {
		const list = signal(['foo', 'bar'])
		const div = html`<div>
			${computed(() => {
				if (!list.value.length) return html`<div>no items</div>`
				return list.value.map((v) => html`<div>${v}</div>`)
			})}
		</div>`.init()
		expect(div.innerText.trim()).toBe('foobar')
		list.value = ['foo', 'baz', 'bar']
		expect(div.innerText.trim()).toBe('foobazbar')
		list.value = []
		expect(div.innerText.trim()).toBe('no items')
	})
})
