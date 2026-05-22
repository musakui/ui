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
		get: (path, opts) => call('GET', path, opts),
		put: (path, opts) => call('PUT', path, opts),
		post: (path, opts) => call('POST', path, opts),
		head: (path, opts) => call('HEAD', path, opts),
		patch: (path, opts) => call('PATCH', path, opts),
		delete: (path, opts) => call('DELETE', path, opts),
		options: (path, opts) => call('OPTIONS', path, opts),
	})
}

/** @returns {undefined} */
function NO_OP() {}
