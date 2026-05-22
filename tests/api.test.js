import { describe, it, expect, afterEach, vi } from 'vitest'
import { HttpError, buildRequest, responseReader } from '#/api/core.js'
import { createInstance } from '#/api/index.js'

afterEach(() => {
	vi.unstubAllGlobals()
})

describe('HttpError', () => {
	it('is an instance of Error', () => {
		const res = new Response('not found', { status: 404, statusText: 'Not Found' })
		const err = new HttpError(res, 'not found')
		expect(err).toBeInstanceOf(Error)
		expect(err).toBeInstanceOf(HttpError)
	})

	it('exposes status, response, and body', () => {
		const res = new Response('{"msg":"bad"}', { status: 400, statusText: 'Bad Request' })
		const body = { msg: 'bad' }
		const err = new HttpError(res, body)
		expect(err.status).toBe(400)
		expect(err.response).toBe(res)
		expect(err.body).toBe(body)
	})

	it('sets message from status and statusText', () => {
		const res = new Response(null, { status: 404, statusText: 'Not Found' })
		const err = new HttpError(res, null)
		expect(err.message).toBe('404 Not Found')
	})
})

describe('buildRequest', () => {
	it('serialises data as JSON body and sets Content-Type', async () => {
		const req = buildRequest('/api/users', { method: 'POST', data: { name: 'Alice' } })
		expect(await req.text()).toBe(JSON.stringify({ name: 'Alice' }))
		expect(req.headers.get('content-type')).toBe('application/json')
	})

	it('merges data Content-Type with provided headers', () => {
		const req = buildRequest('/api/users', {
			method: 'POST',
			data: { name: 'Alice' },
			headers: { Authorization: 'Bearer token' },
		})
		expect(req.headers.get('content-type')).toBe('application/json')
		expect(req.headers.get('authorization')).toBe('Bearer token')
	})

	it('allows caller to override Content-Type when sending data', () => {
		const req = buildRequest('/api/upload', {
			method: 'POST',
			data: 'raw',
			headers: { 'Content-Type': 'text/plain' },
		})
		expect(req.headers.get('content-type')).toBe('text/plain')
	})

	it('appends Record params as URLSearchParams', () => {
		const req = buildRequest('/api/users', { params: { role: 'admin', page: '2' } })
		const url = new URL(req.url)
		expect(url.pathname + url.search).toBe('/api/users?role=admin&page=2')
	})

	it('appends string params directly', () => {
		const req = buildRequest('/api/users', { params: 'role=admin&page=2' })
		const url = new URL(req.url)
		expect(url.pathname + url.search).toBe('/api/users?role=admin&page=2')
	})

	it('uses & when URL already has a query string', () => {
		const req = buildRequest('/api/users?active=true', { params: { role: 'admin' } })
		const url = new URL(req.url)
		expect(url.pathname + url.search).toBe('/api/users?active=true&role=admin')
	})

	it('coerces number params to strings', () => {
		const req = buildRequest('/api/items', { params: { page: 2 } })
		expect(new URL(req.url).searchParams.get('page')).toBe('2')
	})
})

describe('responseReader', () => {
	it('json() fetches and parses JSON', async () => {
		const reader = responseReader(() => new Response('{"id":1}'))
		expect(await reader.json()).toEqual({ id: 1 })
	})

	it('text() fetches and returns text', async () => {
		const reader = responseReader(() => new Response('hello'))
		expect(await reader.text()).toBe('hello')
	})

	it('response gets the raw response', async () => {
		const reader = responseReader(() => new Response('data'))
		const res = await reader.response
		expect(res.body).toBeInstanceOf(ReadableStream)
	})

	it('returns null for 204', async () => {
		const reader = responseReader(() => new Response(null, { status: 204 }))
		expect(await reader.json()).toBeNull()
		expect(await reader.text()).toBeNull()
	})

	it('blob() returns a Blob', async () => {
		const reader = responseReader(() => new Response('data'))
		expect(await reader.blob()).toBeInstanceOf(Blob)
	})

	it('arrayBuffer() returns an ArrayBuffer', async () => {
		const reader = responseReader(() => new Response('data'))
		expect(await reader.arrayBuffer()).toBeInstanceOf(ArrayBuffer)
	})

	it('throws HttpError on non-2xx', async () => {
		const reader = responseReader(() => new Response('no', { status: 404 }))
		await expect(reader.text()).rejects.toBeInstanceOf(HttpError)
	})

	it('parses JSON error body', async () => {
		const reader = responseReader(() => new Response('{"error":"bad"}', { status: 400 }))
		const err = await reader.json().catch((e) => e)
		expect(err).toBeInstanceOf(HttpError)
		expect(err.body).toEqual({ error: 'bad' })
	})

	it('keeps text error body when not JSON', async () => {
		const reader = responseReader(() => new Response('bad request', { status: 400 }))
		const err = await reader.text().catch((e) => e)
		expect(err).toBeInstanceOf(HttpError)
		expect(err.body).toBe('bad request')
	})
})

describe('createInstance', () => {
	it('prepends base URL to all requests', async () => {
		const mock = stubFetch('[]')
		const api = createInstance({ baseUrl: '/api/' })
		await api.get('users').json()
		const req = mock.mock.calls[0][0]
		expect(req.url).toContain('/api/users')
		expect(req.method).toBe('GET')
	})

	it('sends correct HTTP method for each shortcut', async () => {
		const mock = stubFetch(null, { status: 204 })
		const api = createInstance({ baseUrl: '/api/' })
		await api.get('x').json()
		await api.post('x').json()
		await api.put('x').response
		await api.patch('x').text()
		await api.delete('x').response
		await api.head('x').response
		await api.options('x').response
		const methods = mock.mock.calls.map((c) => c[0].method)
		expect(methods).toEqual(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'])
	})

	it('merges default headers with per-call headers', async () => {
		const mock = stubFetch('{}')
		const api = createInstance({
			baseUrl: '/api/',
			defaults: { headers: { Authorization: 'Bearer token' } },
		})
		await api.get('users', { headers: { 'X-Custom': 'val' } }).json()
		const req = mock.mock.calls[0][0]
		expect(req.headers.get('authorization')).toBe('Bearer token')
		expect(req.headers.get('x-custom')).toBe('val')
	})

	it('per-call headers override default headers with same name', async () => {
		const mock = stubFetch('{}')
		const api = createInstance({
			baseUrl: '/api/',
			defaults: { headers: { Authorization: 'Bearer old' } },
		})
		await api.get('users', { headers: { Authorization: 'Bearer new' } }).json()
		expect(mock.mock.calls[0][0].headers.get('Authorization')).toBe('Bearer new')
	})

	it('calls interceptRequest with the Request before fetch', async () => {
		const mock = stubFetch(null, { status: 204 })
		const interceptRequest = vi.fn((req) => req)
		const api = createInstance({ baseUrl: '/api/', interceptRequest })
		await api.get('users').json()
		expect(interceptRequest).toHaveBeenCalledWith(expect.any(Request))
		expect(mock).toHaveBeenCalledWith(interceptRequest.mock.results[0].value)
	})

	it('calls interceptResponse with the Response and Request after fetch', async () => {
		const rawRes = new Response('{}')
		stubFetch(rawRes)
		const interceptResponse = vi.fn((res) => res)
		const api = createInstance({ baseUrl: '/api/', interceptResponse })
		await api.get('users').json()
		expect(interceptResponse).toHaveBeenCalledWith(rawRes, expect.any(Request))
	})

	it('uses original Response when interceptResponse returns undefined', async () => {
		stubFetch(new Response('{"ok":true}'))
		const api = createInstance({ baseUrl: '/api/', interceptResponse: () => undefined })
		const result = await api.get('users').json()
		expect(result).toEqual({ ok: true })
	})

	it('uses original request when interceptRequest returns undefined', async () => {
		const mock = stubFetch(null, { status: 204 })
		const api = createInstance({ baseUrl: '/api/', interceptRequest: () => undefined })
		await api.get('users').json()
		expect(mock).toHaveBeenCalledWith(expect.any(Request))
	})

	it('throws when path starts with "/"', () => {
		const api = createInstance({ baseUrl: '/api/' })
		expect(() => api.get('/users')).toThrow()
	})

	it('interceptResponse can retry using the original request', async () => {
		let callCount = 0
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => {
				callCount++
				return callCount === 1
					? new Response(null, { status: 401 })
					: new Response('{"ok":true}')
			})
		)
		const api = createInstance({
			baseUrl: '/api/',
			interceptResponse: async (res, req) => {
				if (res.status === 401) return fetch(req)
			},
		})
		const result = await api.get('users').json()
		expect(result).toEqual({ ok: true })
		expect(callCount).toBe(2)
	})
})

function stubFetch(bodyOrResp, init) {
	const response =
		bodyOrResp instanceof Response ? bodyOrResp : new Response(bodyOrResp, init)
	const mock = vi.fn().mockResolvedValue(response)
	vi.stubGlobal('fetch', mock)
	return mock
}
