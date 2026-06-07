import { decode } from './core.js'

/**
 * @param {string} blurhash
 * @param {HTMLCanvasElement} canvas
 */
export function toDataURL(blurhash, canvas) {
	if (!blurhash) return null
	const ctx = canvas.getContext('2d')
	if (!ctx) return null
	const { width: w, height: h } = canvas
	ctx.putImageData(new ImageData(decode(blurhash, w, h), w, h), 0, 0)
	return canvas.toDataURL('image/jpeg')
}
