// Tells the preloader the background is done: first frame drawn, or it failed, or it won't load (list view, no WebGL).
// Sets window.__landscapeReady and fires 'landscape:ready' on window, once.
let done = false

export function signalLandscapeReady() {
  if (done) return
  done = true
  ;(window as unknown as { __landscapeReady?: boolean }).__landscapeReady = true
  window.dispatchEvent(new Event('landscape:ready'))
}
