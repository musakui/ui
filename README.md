# ui

> web ui

[![npm](https://img.shields.io/npm/v/@musakui/ui.svg)](https://www.npmjs.com/package/@musakui/ui)

## Features

- `html` tagged template literal (similar to [`lit-html`](https://github.com/lit/lit) and [`uhtml`](https://github.com/WebReflection/uhtml))
- `signal` and `computed` (powered by [`alien-signals`](https://github.com/stackblitz/alien-signals))
- No vDOM, direct content/attribute/property/event bindings

## Usage

### Basic HTML and reactive rendering

```js
import { html, signal, computed, mount } from '@musakui/ui'

function Counter() {
	const count = signal(0)
	const double = computed(() => count.value * 2)

	return html`<div>
		<p>Count: ${count}</p>
		<p>Double: ${double}</p>
		<button @click=${() => count.value++}>Increment</button>
	</div>`
}

mount(Counter, document.body)
```
