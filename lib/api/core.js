export const URL_BASE = location.origin

/** @import { RequestOptions, ResponseReader } from './types' */

export class HttpError extends Error {
	/** @type {number} */
	status

	/** @type {Response} */
	response

	/** @type {unknown} */
	body

	/**
	 * @param {Response} resp
	 * @param {unknown} body
	 */
	constructor(resp, body) {
		super(`${resp.status} ${resp.statusText}`)
		this.name = 'HttpError'
		this.status = resp.status
		this.response = resp
		this.body = body
	}
}

/**
 * @param {string | URL} inp input URL
 * @param {RequestOptions} [opts]
 */
export function buildRequest(inp, opts) {
	const { data, params, headers, ...rest } = opts ?? {}

	const url = new URL(inp, URL_BASE)

	if (params) {
		// @ts-expect-error too strict
		for (const [k, v] of new URLSearchParams(params)) {
			url.searchParams.append(k, v)
		}
	}

	return new Request(url, {
		...rest,
		...(data ? { body: JSON.stringify(data) } : null),
		headers: {
			...(data ? { 'Content-Type': 'application/json' } : null),
			...headers,
		},
	})
}

/** @param {() => Promise<Response>} fn */
export function responseReader(fn) {
	const resp = fn()
	return /** @type {ResponseReader} */ ({
		response: resp,
		clone: () => resp.then((r) => r.clone()),
		json: () => readResponse(resp, (r) => r.json()),
		text: () => readResponse(resp, (r) => r.text()),
		blob: () => readResponse(resp, (r) => r.blob()),
		formData: () => readResponse(resp, (r) => r.formData()),
		arrayBuffer: () => readResponse(resp, (r) => r.arrayBuffer()),
	})
}

/**
 * @template T
 * @param {Promise<Response>} resp
 * @param {(res: Response) => Promise<T>} fn
 */
async function readResponse(resp, fn) {
	const r = await resp
	if (!r.ok) throw new HttpError(r, await parseError(r))
	if (r.status === 204) return null
	return await fn(r)
}

/** @param {Response} res */
async function parseError(res) {
	const txt = await res.text().catch(() => null)
	if (!txt) return null
	try {
		return JSON.parse(txt)
	} catch {
		return txt
	}
}
