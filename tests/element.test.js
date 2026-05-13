import { describe, it, expect, vi } from 'vitest'
import { html, signal } from '#/index.js'
import { defineUiElement } from '#/ce/ui.js'

let c = 0
const tag = () => `x-el-${c++}`

describe('defineElement', () => {
	it('renders template output into element', () => {
		defineUiElement('x-el-basic', () => html`<span>hello</span>`)
		const el = html`<x-el-basic></x-el-basic>`.init()
		document.body.appendChild(el)
		expect(el.querySelector('span').textContent).toBe('hello')
		el.remove()
	})

	it('forwards all attributes to render fn', () => {
		let captured = {}
		defineUiElement('x-el-attrs', function () {
			captured = this.attrs
			return html`<span></span>`
		})
		const el = html`<x-el-attrs label="Click" data-id="42"></x-el-attrs>`.init()
		document.body.appendChild(el)
		expect(captured).toEqual({ label: 'Click', 'data-id': '42' })
		el.remove()
	})

	it('forwards light DOM children to render fn', () => {
		let captured = []
		defineUiElement('x-el-forward', function () {
			captured = this.children
			return html`<div>${this.children}</div>`
		})
		const inner = document.createElement('span')
		inner.innerText = 'inner'
		const el = html`<x-el-forward>${inner}</x-el-forward>`.init()
		document.body.appendChild(el)
		expect(captured).toContain(inner)
		expect(el.querySelector('div span').textContent).toBe('inner')
		el.remove()
	})

	it('preserves original children on reconnect', () => {
		const name = tag()
		const calls = []
		defineUiElement(name, function () {
			calls.push(this.children)
			return html`<div>${this.children}</div>`
		})
		const el = document.createElement(name)
		const child = document.createElement('span')
		el.appendChild(child)
		document.body.appendChild(el)
		el.remove()
		document.body.appendChild(el)
		expect(calls).toHaveLength(2)
		expect(calls[1]).toBe(calls[0])
		expect(calls[1]).toContain(child)
		el.remove()
	})

	it('attrs update on reconnect', () => {
		const calls = []
		defineUiElement('x-el-update-attr', function () {
			calls.push({ ...this.attrs })
			return html`<span></span>`
		})
		const frag = html`<x-el-update-attr label=${'first'}></x-el-update-attr>`
		const el = frag.init()
		document.body.appendChild(el)
		el.remove()
		frag.update(0, 'changed')
		document.body.appendChild(el)
		expect(calls).toHaveLength(2)
		expect(calls[0].label).toBe('first')
		expect(calls[1].label).toBe('changed')
		el.remove()
	})

	it('forwards props to render fn', () => {
		let captured
		defineUiElement('x-forward', function () {
			captured = this.data
			return html`<span></span>`
		})
		const data = { count: 42 }
		const el = html`<x-forward .data=${data}></x-forward>`.init()
		document.body.appendChild(el)
		expect(captured).toBe(data)
		el.remove()
	})

	it('calls opts.state() once and passes result to render fn', () => {
		const name = tag()
		const stateFn = vi.fn(() => ({ count: 0 }))
		let capturedState
		defineUiElement(
			name,
			function () {
				capturedState = this.state
				return html`<span></span>`
			},
			{ state: stateFn }
		)
		const el = document.createElement(name)
		document.body.appendChild(el)
		expect(stateFn).toHaveBeenCalledTimes(1)
		expect(capturedState).toEqual(expect.objectContaining({ count: 0 }))
		el.remove()
	})

	it('state persists across reconnect', () => {
		const name = tag()
		const stateFn = vi.fn(() => ({ count: signal(0) }))
		let capturedState
		defineUiElement(
			name,
			function () {
				capturedState = this.state
				return html`<span></span>`
			},
			{ state: stateFn }
		)
		const el = document.createElement(name)
		document.body.appendChild(el)
		const firstState = capturedState
		el.remove()
		document.body.appendChild(el)
		expect(stateFn).toHaveBeenCalledTimes(1)
		expect(capturedState).toBe(firstState)
		el.remove()
	})

	it('stops reactive effects on disconnect', () => {
		const name = tag()
		const count = signal(0)
		defineUiElement(name, () => html`<span>${count}</span>`)
		const el = document.createElement(name)
		document.body.appendChild(el)
		expect(el.querySelector('span').textContent).toBe('0')
		el.remove()
		count.value = 99
		expect(el.querySelector('span').textContent).toBe('0')
	})
})
