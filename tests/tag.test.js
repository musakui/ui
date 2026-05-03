import { describe, it, expect } from 'vitest'
import { html, svg, mathml } from '#/tag/index.js'

describe('html template tag', () => {
	// duplicated test as import at this path trigger unwrapping
	it('should render simple html', () => {
		const frag = html`<div>hello<span>world</span></div>`.init()
		expect(frag.el.outerHTML).toBe('<div>hello<span>world</span></div>')
	})
})

describe('svg template tag', () => {
	it('should render an svg element', () => {
		const frag = svg`<circle r=${'10'} />`.init()
		frag.commit()
		expect(frag.el.tagName.toLowerCase()).toBe('circle')
		expect(frag.el.namespaceURI).toBe('http://www.w3.org/2000/svg')
		expect(frag.el.getAttribute('r')).toBe('10')
	})

	it('should update svg attributes', () => {
		const frag = svg`<rect width=${'100'} height=${'50'} />`.init()
		frag.commit()
		expect(frag.el.getAttribute('width')).toBe('100')
		frag.update(0, '200')
		frag.commit()
		expect(frag.el.getAttribute('width')).toBe('200')
	})
})

describe('mathml template tag', () => {
	it('should render a mathml element with content binding', () => {
		const frag = mathml`<mn>${'42'}</mn>`.init()
		frag.commit()
		expect(frag.el.tagName.toLowerCase()).toBe('mn')
		expect(frag.el.textContent).toBe('42')
	})
})
