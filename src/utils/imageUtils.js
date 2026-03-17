/**
 * imageUtils.js — helpers for reading canvas pixel data into tensor arrays.
 */

const DISPLAY_SIZE = 32 // internal tensor resolution (32×32 — good balance)

/**
 * Load an image URL into a canvas and extract pixel data.
 * Returns { grayData: number[][], rgbData: [number[][], number[][], number[][]] }
 * where grayData[y][x] is in [0, 255] and rgbData[c][y][x] is in [0, 255].
 */
export async function loadImagePixels(src, size = DISPLAY_SIZE) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, size, size)
      const raw = ctx.getImageData(0, 0, size, size).data // RGBA flat array

      const gray = []
      const r = [], g = [], b = []
      for (let y = 0; y < size; y++) {
        gray.push([])
        r.push([]); g.push([]); b.push([])
        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * 4
          const rv = raw[idx]
          const gv = raw[idx + 1]
          const bv = raw[idx + 2]
          const grayVal = Math.round(0.299 * rv + 0.587 * gv + 0.114 * bv)
          gray[y].push(grayVal)
          r[y].push(rv); g[y].push(gv); b[y].push(bv)
        }
      }
      resolve({ grayData: gray, rgbData: [r, g, b], size })
    }
    img.onerror = reject
    img.crossOrigin = 'anonymous'
    img.src = src
  })
}

/** Map a 0-255 value to a CSS rgba for heatmap coloring (grayscale) */
export function grayToColor(v) {
  return `rgb(${v},${v},${v})`
}

/** Map a 0-255 channel value to a color for that channel */
export function channelToColor(v, channel) {
  if (channel === 0) return `rgba(${v},40,40,${0.3 + (v / 255) * 0.65})`
  if (channel === 1) return `rgba(40,${v},40,${0.3 + (v / 255) * 0.65})`
  return `rgba(40,40,${v},${0.3 + (v / 255) * 0.65})`
}
