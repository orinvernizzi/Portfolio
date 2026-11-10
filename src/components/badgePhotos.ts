// Every image dropped in src/assets/badge/ shows up here, sorted by file name.
export const PHOTOS: string[] = Object.entries(
  import.meta.glob<string>('../assets/badge/*.{jpg,jpeg,png,webp}', { eager: true, query: '?url', import: 'default' }),
)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, url]) => url)

const FALLBACK_RATIO = 3 / 2
const ratios = new Map<string, number>()
const loading = new Map<string, Promise<number>>()
const held = new Set<HTMLImageElement>() // keeps decoded bitmaps alive for the reel

export const getRatio = (url: string) => ratios.get(url)

// Fetches and decodes one photo once; resolves with its width / height.
export function loadPhoto(url: string): Promise<number> {
  const known = loading.get(url)
  if (known) return known
  const promise = new Promise<number>((resolve) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight || FALLBACK_RATIO
      ratios.set(url, ratio)
      held.add(img)
      img.decode().then(() => resolve(ratio), () => resolve(ratio))
    }
    img.onerror = () => resolve(FALLBACK_RATIO)
    img.src = url
  })
  loading.set(url, promise)
  return promise
}

export const preloadPhotos = () => PHOTOS.forEach(loadPhoto)
