import { isStr } from '#/util/type.js'
import { signal } from '#/signal/index.js'
import { handleNavigate, createMatcher } from './core.js'

/**
 * @param {import('./types').Page} page
 */
export function definePage(page) {
	return page
}

/**
 * @param {import('./types').RouterOpts} opts
 */
export function createRouter(opts) {
	const errorPage = opts.errorPage ?? ((err) => `error: ${err}`)
	const loadingPage = opts.loadingPage ?? (() => 'loading...')
	const notFoundPage = opts.notFoundPage ?? (() => 'page not found')

	const matcher = createMatcher(opts.routes)
	const match = signal(matcher(location.pathname))
	const outlet = signal(loadingPage())

	let curLoadId = 0

	async function loadPage() {
		const m = match.value
		if (!m) {
			outlet.value = notFoundPage()
			return
		}

		const loadId = ++curLoadId
		const { page, ...ctx } = m
		const maybePage = page(ctx)

		raceTimeout(maybePage, 99).then((r) => {
			if (!r || loadId !== curLoadId) return
			outlet.value = loadingPage()
		})

		try {
			const res = await maybePage
			if (loadId !== curLoadId) return
			outlet.value = isStr(res) || !('default' in res) ? res : res.default(ctx)
		} catch (err) {
			if (loadId !== curLoadId) return
			outlet.value = errorPage(err)
		}
	}

	const dispose = handleNavigate((evt, pathname) => {
		match.value = matcher(pathname)
		evt.intercept({
			async handler() {
				await loadPage()
			},
		})
	})

	loadPage().catch(() => {})

	return {
		match,
		outlet,
		dispose,
	}
}

const TIMEOUT = {}

/**
 * @param {unknown} prom
 * @param {number} timeout
 * @returns timed out?
 */
async function raceTimeout(prom, timeout) {
	let timer = /** @type {number | null} */ (null)
	const rc = new Promise((r) => {
		timer = setTimeout(() => r(TIMEOUT), timeout)
	})
	try {
		return (await Promise.race([prom, rc])) === TIMEOUT
	} catch (err) {
		return false
	} finally {
		if (timer !== null) clearTimeout(timer)
	}
}
