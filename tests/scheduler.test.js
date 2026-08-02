import { describe, it, expect, vi } from 'vitest'
import { html, signal, computed } from '#/index.js'
import { bindEffect } from '#/util/scheduler.js'

describe('bindEffect', () => {
	it('performs the initial render after a microtask', async () => {
		const count = signal(1)
		const frag = html`<div>${count}</div>`.init()
		bindEffect(frag)
		expect(frag.el.textContent).toBe('')
		await tick()
		expect(frag.el.textContent).toBe('1')
	})

	it('defers DOM updates to the next microtask', async () => {
		const v = signal('a')
		const frag = html`<div>${v}</div>`.init()
		bindEffect(frag)
		await tick()
		expect(frag.el.textContent).toBe('a')
		v.value = 'b'
		expect(frag.el.textContent).toBe('a')
		v.value = 'c'
		expect(frag.el.textContent).toBe('a')
		await tick()
		expect(frag.el.textContent).toBe('c')
	})

	it('stops reacting after dispose', async () => {
		const count = signal(1)
		const frag = html`<div>${count}</div>`.init()
		const dispose = bindEffect(frag)
		await tick()
		expect(frag.el.textContent).toBe('1')
		dispose()
		count.value = 2
		await tick()
		expect(frag.el.textContent).toBe('1')
	})

	it('renders a static template with no bindings correctly', async () => {
		const frag = html`<p>no bindings here</p>`.init()
		bindEffect(frag)
		await tick()
		expect(frag.el.textContent).toBe('no bindings here')
	})

	it('skips flush for a fragment disconnected during the same flush cycle', async () => {
		const fn = vi.fn()
		const show = signal(true)
		const count = signal(0)
		const inner = html`<div ${fn}>${count}</div>`
		// prettier-ignore
		const outer = html`<section>${computed(() => (show.value ? inner : null))}</section>`.init()
		bindEffect(outer)
		await tick()
		expect(fn).toHaveBeenCalledTimes(1)

		// show changes first → outer's effect fires first → outer added to pending first
		// count changes second → inner's effect fires second → inner added to pending second
		show.value = false
		count.value = 1
		await tick()

		// outer was flushed, inner disconnected
		expect(fn).toHaveBeenCalledTimes(1)
		expect(outer.el.textContent).toBe('')
	})

	it('processes fragments added to pending during a flush in the same microtask', async () => {
		const inner = signal('hello')
		const frag = html`<div>${computed(() => html`<span>${inner}</span>`)}</div>`.init()
		bindEffect(frag)
		await tick()
		expect(frag.el.querySelector('span').textContent).toBe('hello')
	})

	it('binds reactive effects on newly inserted nested fragments', async () => {
		const inner = signal(1)
		const show = signal(false)
		const frag = html`<div>
			${computed(() => (show.value ? html`<span>${inner}</span>` : null))}
		</div>`.init()
		bindEffect(frag)
		show.value = true
		await tick()
		expect(frag.el.querySelector('span').textContent).toBe('1')
		inner.value = 2
		await tick()
		expect(frag.el.querySelector('span').textContent).toBe('2')
	})
})

function tick() {
	return Promise.resolve()
}
