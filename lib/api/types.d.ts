export interface RequestOptions extends RequestInit {
	/** JSON data */
	data?: unknown

	/** URL search parameters to be added */
	params?:
		| string
		| URLSearchParams
		| Record<string, string | number>
		| Iterable<[key: string, val: string | number]>
}

export interface InstanceOptions {
	/**
	 * Base URL for instance. Should end with `/`
	 */
	baseUrl: string

	/**
	 * Default request init options to be merged in.
	 */
	defaults?: RequestInit

	/**
	 * Request interceptor.
	 *
	 * Receives the `Request` just before it gets passed to `fetch`.
	 *
	 * If this returns `undefined`, the original request will be sent
	 */
	interceptRequest?: (req: Request) => Request | Promise<Request> | undefined

	/**
	 * Response interceptor.
	 *
	 * Receives the `Response` fresh from `fetch` and the original `Request`.
	 *
	 * If this returns `undefined`, the original response will be processed.
	 */
	interceptResponse?: (
		res: Response,
		req: Request
	) => Response | Promise<Response> | undefined
}

export type ResponseReader = {
	/** The raw response (wrapped in a Promise). */
	response: Promise<Response>

	/** Create a copy of the response object. */
	clone(): Promise<Response>

	/** Get the response body as JSON */
	json<T = unknown>(_?: T): Promise<T | null>

	/** Get the response body as text */
	text(): Promise<string | null>

	/** Get the response body as a Blob */
	blob(): Promise<Blob | null>

	/** Get the response body as FormData */
	formData(): Promise<FormData | null>

	/** Get the response body as an ArrayBuffer */
	arrayBuffer(): Promise<ArrayBuffer | null>
}

export interface ApiInstance {
	/**
	 * Make a HTTP GET request.
	 * @param path relative path
	 */
	get(path: string, opts?: RequestOptions): ResponseReader

	/**
	 * Make a HTTP PUT request.
	 * @param path relative path
	 */
	put(path: string, opts?: RequestOptions): ResponseReader

	/**
	 * Make a HTTP POST request.
	 * @param path relative path
	 */
	post(path: string, opts?: RequestOptions): ResponseReader

	/**
	 * Make a HTTP HEAD request.
	 * @param path relative path
	 */
	head(path: string, opts?: RequestOptions): ResponseReader

	/**
	 * Make a HTTP PATCH request.
	 * @param path relative path
	 */
	patch(path: string, opts?: RequestOptions): ResponseReader

	/**
	 * Make a HTTP DELETE request.
	 * @param path relative path
	 */
	delete(path: string, opts?: RequestOptions): ResponseReader

	/**
	 * Make a HTTP OPTIONS request.
	 * @param path relative path
	 */
	options(path: string, opts?: RequestOptions): ResponseReader
}
