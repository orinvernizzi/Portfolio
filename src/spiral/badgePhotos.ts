// The photos for the corner badge and the photo reel, in play order. They are the files in public/photos.
// To add one: drop it in public/photos and add its path to this list.
// The rest of the file loads each photo once and remembers its width and height for the reel.
export const PHOTOS: string[] = [
  '/photos/portrait.webp',
  '/photos/rowing-paraguay.webp',
  '/photos/rowing-hocr.webp',
  '/photos/techo-1.webp',
  '/photos/techo-2.webp',
]

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
