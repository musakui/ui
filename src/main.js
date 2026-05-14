import App from './app.js'
import { mount } from '#/index.js'

let stop = mount(App, document.body)

if (import.meta.hot) {
	import.meta.hot.accept('./app.js', (m) => {
		stop()
		if (!m) return
		stop = mount(m.default, document.body)
	})
}
