import { URL_BASE, HttpError, buildRequest, responseReader } from './core.js'

/** @import { RequestOptions, InstanceOptions, ApiInstance } from './types' */

/** @param {unknown} v */
export const isHttpError = (v) => v instanceof HttpError

/**
 * @param {string | URL} url
 * @param {RequestOptions} [opts]
 */
export function request(url, opts) {
	return responseReader(() => fetch(buildRequest(url, opts)))
}

/**
 * @param {InstanceOptions} opts
 */
export function createInstance(opts) {
	const base = new URL(opts.baseUrl, URL_BASE)
	const interceptRequest = opts.interceptRequest ?? NO_OP
	const interceptResponse = opts.interceptResponse ?? NO_OP
	const { headers: defaultHeaders, ...defaultRest } = opts.defaults ?? {}

	/**
	 * @param {string} method
	 * @param {string} path
	 * @param {RequestOptions} [opts]
	 */
	const call = (method, path, opts) => {
		if (path[0] === '/') throw new Error(`path must not start with "/"`)

		const mergedOpts = {
			...defaultRest,
			...opts,
			method,
			headers: { ...defaultHeaders, ...opts?.headers },
		}

		const oriReq = buildRequest(new URL(path, base), mergedOpts)

		return responseReader(async () => {
			const req = (await interceptRequest(oriReq)) ?? oriReq
			const res = await fetch(req)
			return (await interceptResponse(res, req)) ?? res
		})
	}

	return /** @type {ApiInstance} */ ({
		get: (p, o) => call('GET', p, o),
		put: (p, o) => call('PUT', p, o),
		post: (p, o) => call('POST', p, o),
		head: (p, o) => call('HEAD', p, o),
		patch: (p, o) => call('PATCH', p, o),
		query: (p, o) => call('QUERY', p, o),
		delete: (p, o) => call('DELETE', p, o),
		options: (p, o) => call('OPTIONS', p, o),
	})
}

/** @returns {undefined} */
function NO_OP() {}
