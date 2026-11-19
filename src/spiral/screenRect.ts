// Where a 3D card sits on screen, in CSS pixels. The panel uses it to grow out of the card you clicked.
import * as THREE from 'three'

export interface ScreenRect {
  x: number
  y: number
  width: number
  height: number
}

// The card's two "to and from" spots: the clicked card now, and the front card it closes back into.
export interface PanelOrigin {
  from: ScreenRect
  back: ScreenRect
}

const corner = new THREE.Vector3()

// Projects the 4 corners of a width × height plane (centred on `object`) and returns their bounding box.
export function screenRect(object: THREE.Object3D, width: number, height: number, camera: THREE.Camera, canvas: HTMLCanvasElement): ScreenRect {
  object.updateWorldMatrix(true, false)
  const box = canvas.getBoundingClientRect()
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    corner.set((sx * width) / 2, (sy * height) / 2, 0).applyMatrix4(object.matrixWorld).project(camera)
    const px = box.left + ((corner.x + 1) / 2) * box.width
    const py = box.top + ((1 - corner.y) / 2) * box.height
    minX = Math.min(minX, px)
    maxX = Math.max(maxX, px)
    minY = Math.min(minY, py)
    maxY = Math.max(maxY, py)
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}
