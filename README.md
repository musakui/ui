# ui

> web ui

## Features

- `html` tagged template literal (similar to [`lit-html`](https://github.com/lit/lit) and [`uhtml`](https://github.com/WebReflection/uhtml))
- `signal` and `computed` (powered by [`alien-signals`](https://github.com/stackblitz/alien-signals))
- No vDOM, direct content/attribute/property/event bindings

## Usage

### Basic HTML and reactive rendering

```js
import { html, signal, computed } from '@musakui/ui'

function Counter() {
	const count = signal(0)
	const double = computed(() => count.value * 2)

	const frag = html`<div>
		<p>Count: ${count}</p>
		<p>Double: ${double}</p>
		<button @click=${() => count.value++}>Increment</button>
	</div>`

	// nothing is created until `.init()` is called
	return frag.init()
}

document.body.append(Counter())
```
