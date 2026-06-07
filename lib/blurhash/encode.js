import { e83, sPow, toLinear, _sRGB } from './core.js'

/**
 * @param {Uint8ClampedArray} pixels
 * @param {number} width
 * @param {number} height
 * @param {number} cX
 * @param {number} cY
 */
export function encode(pixels, width, height, cX, cY) {
	if (!(cX > 0 && cX < 10 && cY > 0 && cY < 10)) {
		throw new Error('BlurHash must have between 1 and 9 components')
	}

	const size = width * height

	if (size * 4 !== pixels.length) {
		throw new Error('Width and height must match the pixels array')
	}

	const bytesPerRow = width * 4 // 4 bytes per pixel

	/** @type {[r: number, g: number, b: number][]} */
	const factors = []

	for (let y = 0; y < cY; ++y) {
		for (let x = 0; x < cX; ++x) {
			let r = 0
			let g = 0
			let b = 0

			const norm = !x && !y ? 1 : 2

			for (let j = 0; j < height; ++j) {
				const rowOffset = j * bytesPerRow
				const cosY = norm * Math.cos((Math.PI * y * j) / height)

				for (let i = 0; i < width; ++i) {
					const idx = rowOffset + i * 4
					const basis = cosY * Math.cos((Math.PI * x * i) / width)
					r += basis * toLinear(pixels[idx])
					g += basis * toLinear(pixels[idx + 1])
					b += basis * toLinear(pixels[idx + 2])
				}
			}

			factors.push([r / size, g / size, b / size])
		}
	}

	const [dc, ...ac] = factors

	let hash = enc83(cX - 1 + (cY - 1) * 9, 1)

	let maxV = 1
	if (ac.length) {
		const qMax = clamp(Math.floor(Math.max(...ac.flat(3)) * 166 - 0.5), 0, 82)
		maxV = (qMax + 1) / 166
		hash += enc83(qMax, 1)
	} else {
		hash += enc83(0, 1)
	}

	hash += enc83((_sRGB(dc[0]) << 16) + (_sRGB(dc[1]) << 8) + _sRGB(dc[2]), 4)

	/** @param {number} val */
	function quantize(val) {
		return clamp(Math.floor(sPow(val / maxV, 0.5) * 9 + 9.5), 0, 18)
	}

	for (const [r, g, b] of ac) {
		hash += enc83(quantize(r) * 361 + quantize(g) * 19 + quantize(b), 2)
	}

	return hash
}

/**
 * @param {number} n
 * @param {number} len
 */
function enc83(n, len) {
	let val = ''
	for (let i = 1; i <= len; ++i) {
		val += e83[Math.floor((Math.floor(n) / Math.pow(83, len - i)) % 83)]
	}
	return val
}

/**
 * @param {number} val
 * @param {number} min
 * @param {number} max
 */
function clamp(val, min, max) {
	return Math.max(min, Math.min(max, val))
}
