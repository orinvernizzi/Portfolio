// The slowly turning globe behind the panels. It loads only when a panel opens.
// Colours: `color` and `color2` are the two globe colours and `backgroundColor` is the background, as 0xRRGGBB numbers
// (0xffffff is white, 0x000000 is black). Sharpness: SCALE below (lower is lighter on the computer but blurrier).
// The globe is switched off for people who asked their device to reduce motion (see src/components/VantaGlobe.tsx).
export interface Globe {
  destroy(): void
}

interface VantaEffect {
  destroy(): void
  renderer?: { dispose(): void; forceContextLoss(): void }
}

// Wide panels at full pixel ratio cost too much fill rate.
const SCALE = Math.min(window.devicePixelRatio || 1, 1.5)

export async function createGlobe(el: HTMLElement): Promise<Globe> {
  const [vantaMod, three] = await Promise.all([import('vanta/dist/vanta.globe.min'), import('three134')])
  const GLOBE = vantaMod.default?.default ?? vantaMod.default ?? vantaMod
  const effect: VantaEffect = GLOBE({
    el,
    THREE: three,
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200,
    minWidth: 200,
    scale: SCALE,
    scaleMobile: SCALE,
    color: 0xffffff,
    color2: 0x000000,
    backgroundColor: 0x000000,
  })
  return {
    destroy() {
      const renderer = effect.renderer
      effect.destroy()
      // Vanta leaves the WebGL context alive; release it so repeated opens don't leak.
      renderer?.dispose()
      renderer?.forceContextLoss()
    },
  }
}
