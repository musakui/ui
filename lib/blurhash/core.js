const S_D = 3294.6
const S_E = 269.025

export const e83 =
	'0123456789' +
	'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
	'abcdefghijklmnopqrstuvwxyz' +
	'#$%*+,-.:;=?@[]^_{|}~'

const digitLookup = new Uint8Array(128)
for (let i = 0; i < e83.length; ++i) {
	digitLookup[e83.charCodeAt(i)] = i
}

/**
 * @param {string} blurhash
 */
export function components(blurhash) {
	const bl = blurhash?.length
	if (!bl || bl < 6) {
		throw new Error('blurhash must be at least 6 characters')
	}

	const size = dec83(blurhash[0])
	const numY = Math.floor(size / 9) + 1
	const numX = (size % 9) + 1

	const len = 4 + 2 * numX * numY
	if (bl !== len) {
		throw new Error(`blurhash length is ${bl} (expected: ${len})`)
	}

	return /** @type {[x: number, y: number]} */ ([numX, numY])
}

/**
 * @param {string} blurhash
 * @param {number} width
 * @param {number} height
 * @param {number} [punch]
 */
export function decode(blurhash, width, height, punch) {
	const [numX, numY] = components(blurhash)
	const maxV = (((punch || 0) | 1) * (dec83(blurhash[1]) + 1)) / 166

	/** @param {number} n */
	function toColor(n) {
		return maxV * sPow((n - 9) / 9, 2)
	}

	const total = numX * numY
	const colors = new Float32Array(total * 3)
	const avg = dec83(blurhash.slice(2, 6))

	colors[0] = toLinear(avg >> 16)
	colors[1] = toLinear((avg >> 8) & 255)
	colors[2] = toLinear(avg & 255)

	for (let i = 1; i < total; ++i) {
		const v = dec83(blurhash.slice(4 + i * 2, 6 + i * 2))
		const idx = i * 3
		colors[idx] = toColor(Math.floor(v / 361))
		colors[idx + 1] = toColor(Math.floor(v / 19) % 19)
		colors[idx + 2] = toColor(v % 19)
	}

	const stride = numX * 3
	const bytesPerRow = width * 4
	const pixels = new Uint8ClampedArray(bytesPerRow * height)

	for (let y = 0; y < height; y++) {
		const rowOffset = y * bytesPerRow
		const py = (Math.PI * y) / height
		for (let x = 0; x < width; x++) {
			let r = 0
			let g = 0
			let b = 0

			const px = (Math.PI * x) / width

			for (let j = 0; j < numY; ++j) {
				let c = j * stride
				const bY = Math.cos(py * j)
				for (let i = 0; i < numX; ++i) {
					const basis = Math.cos(px * i) * bY
					r += basis * colors[c++]
					g += basis * colors[c++]
					b += basis * colors[c++]
				}
			}

			const off = rowOffset + x * 4
			pixels[off] = _sRGB(r)
			pixels[off + 1] = _sRGB(g)
			pixels[off + 2] = _sRGB(b)
			pixels[off + 3] = 255
		}
	}

	return pixels
}

/** @param {number} sRGB */
export function toLinear(sRGB) {
	return sRGB > 10.31475 ? Math.pow(sRGB / S_E + 0.052132, 2.4) : sRGB / S_D
}

/** @param {number} val */
export function _sRGB(val) {
	return ~~(val > 0.00001227 ? S_E * Math.pow(val, 0.416666) - 13.025 : val * S_D + 1)
}

/** @param {string} str */
export function dec83(str) {
	let val = 0
	for (const c of str) {
		val = val * 83 + digitLookup[c.charCodeAt(0)]
	}
	return val
}

/**
 * @param {number} val
 * @param {number} exp
 */
export function sPow(val, exp) {
	return (val < 0 ? -1 : 1) * Math.pow(Math.abs(val), exp)
}
