import { effect } from 'alien-signals'
import { describe, it, expect } from 'vitest'
import { signal, computed } from '#/signal/index.js'

describe('signal', () => {
	it('should hold a value', () => {
		const count = signal(0)
		expect(count.value).toBe(0)
		count.value = 1
		expect(count.value).toBe(1)
	})

	it('should trigger computed', () => {
		const count = signal(1)
		const double = computed(() => count.value * 2)
		expect(double.value).toBe(2)
		count.value = 2
		expect(double.value).toBe(4)
	})

	it('should trigger effect', () => {
		const count = signal(0)
		let val = 0
		effect(() => {
			val = count.value
		})
		expect(val).toBe(0)
		count.value = 1
		expect(val).toBe(1)
	})
})
