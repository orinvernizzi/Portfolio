// Night mountain landscape behind every panel: craggy ridges around a dotted basin, grey lit slopes, a soft haze at the horizon,
// all drifting slowly toward you. Terrain and dots are drawn by shaders that share one height function (HEIGHT_GLSL).
// Knobs are in the block below. Reduced motion draws a single still frame. WebGL errors leave the panel plain black.
import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useReducedMotion } from '../lib/useReducedMotion'

// ---- Knobs ----
const SPEED = 3 // forward drift, world units per second
const DOT_SPACING = 1.2 // distance between dots on the ground
const DOT_SIZE = 2.8 // dot size in px at 30 units away (before pixel ratio)
const DOT_COLOR = '#ffffff'
const SLOPE_COLOR = '#8a8a8a' // lit slope colour, used as a linear value (scaled down by the lighting)
const FLOOR_HEIGHT = 2.5 // roughness of the basin floor
const RIDGE_HEIGHT = 24 // mountain height near the horizon
const SIDE_HEIGHT = 16 // extra rise toward the left and right edges
const NOISE_SCALE = 0.014 // lower = wider mountains
const CRAG = 0.4 // how craggy the crests are (0 = smooth)
const FOG = 0.0046 // higher = shorter view
const HAZE = 0.36 // brightness of the horizon glow (0 = black)
const TWINKLE = 0.5 // 0 = steady dots, 1 = strong flicker
const PARALLAX = 4 // camera sway with the mouse, world units
const CAMERA = { y: 17, z: 16, lookY: 9, lookZ: -70, fov: 55 }
// ---------------

const WIDTH = 440 // wide enough for short, wide panels; the edges fade into haze (see EDGE)
const DEPTH = 240 // terrain runs from z = 20 back to z = 20 - DEPTH
const FRONT = 20
const EDGE = (WIDTH * 0.31).toFixed(1) // |x| where terrain and dots start fading into haze

const HEIGHT_GLSL = /* glsl */ `
uniform float uOffset;
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
float snoise(vec2 v){
  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy)); vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
  vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1; i=mod289(i);
  vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
  m=m*m; m=m*m;
  vec3 x=2.0*fract(p*C.www)-1.0; vec3 h=abs(x)-0.5; vec3 ox=floor(x+0.5); vec3 a0=x-ox;
  m*=1.79284291400159-0.85373472095312*(a0*a0+h*h);
  vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.0*dot(m,g);
}
// Height at a point on the terrain. zLocal is the position in front of the camera; the noise is read at zLocal - uOffset,
// which is what makes the ground flow toward the camera without ever repeating.
// A smooth rolling mass (2 noise samples) carries a ridged component (2 samples) that only shows on top of it, so the
// mountains are broad with craggy crests. It grows with distance and toward the left and right edges around a calm basin.
float terrainHeight(vec2 xz, float zLocal){
  vec2 p=vec2(xz.x,zLocal-uOffset)*${NOISE_SCALE.toFixed(4)};
  float dist=max(0.0,${FRONT.toFixed(1)}-zLocal);
  float far=smoothstep(20.0,150.0,dist);
  float side=smoothstep(28.0,125.0,abs(xz.x));
  float mass=smoothstep(-0.35,0.65,snoise(p)*0.7+snoise(p*2.3)*0.3);
  float n1=1.0-abs(snoise(p*3.1+vec2(5.2,1.3))); 
  float n2=1.0-abs(snoise(p*6.7+vec2(2.9,8.1)));
  float crag=(n1*n1*0.75+n2*n2*0.25)*mass*mass;
  float env=0.5+far*${RIDGE_HEIGHT.toFixed(1)}+side*${SIDE_HEIGHT.toFixed(1)}*(0.25+0.75*far);
  return (n2-0.5)*${FLOOR_HEIGHT.toFixed(1)}+env*(mass*0.8+crag*${CRAG.toFixed(2)});
}
// Slope from two extra samples (forward differences); h is the height already computed at xz.
vec3 terrainNormal(vec2 xz, float zLocal, float h){
  float e=1.4;
  float hx=terrainHeight(xz+vec2(e,0.0),zLocal)-h;
  float hz=terrainHeight(xz,zLocal+e)-h;
  return normalize(vec3(-hx,e,-hz));
}
const vec3 LIGHT=normalize(vec3(-0.7,0.5,0.25)); // from the upper left
`

const TERRAIN_VERT = /* glsl */ `
${HEIGHT_GLSL}
varying float vDist;
varying float vLit;
varying float vY;
varying float vEdge;
void main(){
  vec3 pos=position;
  vEdge=1.0-smoothstep(${EDGE},${(WIDTH / 2).toFixed(1)},abs(pos.x));
  pos.y=terrainHeight(pos.xz,pos.z);
  vec3 n=terrainNormal(pos.xz,pos.z,pos.y);
  vLit=max(dot(n,LIGHT),0.0);
  vY=pos.y;
  vec4 mv=modelViewMatrix*vec4(pos,1.0);
  vDist=length(mv.xyz);
  gl_Position=projectionMatrix*mv;
}`

const TERRAIN_FRAG = /* glsl */ `
uniform vec3 uTint;
varying float vDist;
varying float vLit;
varying float vY;
varying float vEdge;
void main(){
  float fog=vEdge*exp(-pow(vDist*${FOG.toFixed(4)},2.0));
  float lit=pow(vLit,1.15);
  vec3 col=vec3(0.018)+uTint*lit*1.6;
  col*=0.7+0.3*clamp(vY/22.0,0.0,1.0);
  vec3 haze=vec3(${HAZE.toFixed(3)})*exp(-max(vY,0.0)*0.02);
  gl_FragColor=vec4(mix(haze,col,fog),1.0);
}`

const SKY_VERT = /* glsl */ `
varying vec3 vWorld;
void main(){
  vec4 w=modelMatrix*vec4(position,1.0);
  vWorld=w.xyz;
  gl_Position=projectionMatrix*viewMatrix*w;
}`

const SKY_FRAG = /* glsl */ `
varying vec3 vWorld;
void main(){
  float up=normalize(vWorld-cameraPosition).y;
  float g=exp(-max(up+0.03,0.0)*9.0);
  gl_FragColor=vec4(vec3(${HAZE.toFixed(3)})*g,1.0);
}`

const DOT_VERT = /* glsl */ `
${HEIGHT_GLSL}
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
attribute vec2 aCell; // fixed grid cell: x, and z in [0, DEPTH)
varying float vAlpha;
void main(){
  float zLocal=${(FRONT - DEPTH).toFixed(1)}+mod(aCell.y+uOffset,${DEPTH.toFixed(1)});
  vec2 xz=vec2(aCell.x,zLocal);
  float h=terrainHeight(xz,zLocal);
  vec3 n=terrainNormal(xz,zLocal,h);
  vec4 mv=modelViewMatrix*vec4(xz.x,h+0.3+0.012*max(0.0,${FRONT.toFixed(1)}-zLocal),zLocal,1.0);
  float dist=length(mv.xyz);
  float fog=exp(-pow(dist*${FOG.toFixed(4)},2.0));
  float seed=fract(sin(dot(aCell+vec2(3.1,7.7),vec2(12.9898,78.233)))*43758.5453);
  float tw=1.0-${TWINKLE.toFixed(2)}*(0.5+0.5*sin(uTime*(0.7+seed*1.6)+seed*40.0));
  float star=step(0.9,seed); // a tenth of the dots are brighter and larger
  float lit=0.6+0.4*clamp(dot(n,LIGHT)*1.5,0.0,1.0);
  float nearFade=smoothstep(2.0,12.0,dist);
  float rowFade=smoothstep(${(FRONT - DEPTH).toFixed(1)},${(FRONT - DEPTH + 30).toFixed(1)},zLocal); // new rows fade in at the far end
  float edge=1.0-smoothstep(${EDGE},${(WIDTH / 2).toFixed(1)},abs(xz.x));
  vAlpha=min(fog*tw*lit*nearFade*(1.0+0.6*star)*1.35,1.0)*rowFade*edge;
  gl_PointSize=clamp(uSize*uPixelRatio*30.0/dist*(1.0+0.5*star),1.15*uPixelRatio,5.0*uPixelRatio);
  gl_Position=projectionMatrix*mv;
}`

const DOT_FRAG = /* glsl */ `
uniform vec3 uColor;
varying float vAlpha;
void main(){
  float d=length(gl_PointCoord-0.5)*2.0;
  float a=smoothstep(1.0,0.15,d)*vAlpha;
  if(a<0.01) discard;
  gl_FragColor=vec4(uColor,a);
}`

// Phones and very sharp screens get a lighter mesh, fewer dots and no extra pixel ratio.
const isSmall = () => window.innerWidth < 768 || window.devicePixelRatio > 2

function Scene({ animate, small }: { animate: boolean; small: boolean }) {
  const dpr = useThree((s) => s.viewport.dpr)
  const pointer = useRef({ x: 0, y: 0 })

  const shared = useMemo(() => ({ uOffset: { value: 0 } }), [])
  const terrain = useMemo(() => {
    const geo = new THREE.PlaneGeometry(WIDTH, DEPTH, small ? 170 : 260, small ? 130 : 210)
    geo.rotateX(-Math.PI / 2)
    geo.translate(0, 0, FRONT - DEPTH / 2)
    const mat = new THREE.ShaderMaterial({
      vertexShader: TERRAIN_VERT,
      fragmentShader: TERRAIN_FRAG,
      uniforms: { uOffset: shared.uOffset, uTint: { value: new THREE.Color(SLOPE_COLOR) } },
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    })
    return { geo, mat }
  }, [shared, small])

  const sky = useMemo(() => {
    const geo = new THREE.SphereGeometry(380, 24, 16)
    const mat = new THREE.ShaderMaterial({
      vertexShader: SKY_VERT,
      fragmentShader: SKY_FRAG,
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: false,
    })
    return { geo, mat }
  }, [])

  const dots = useMemo(() => {
    const spacing = small ? DOT_SPACING * 1.6 : DOT_SPACING
    const cols = Math.floor(WIDTH / spacing)
    const rows = Math.floor(DEPTH / spacing)
    const cell = new Float32Array(cols * rows * 2)
    let k = 0
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        cell[k++] = (i - cols / 2) * spacing
        cell[k++] = j * spacing
      }
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('aCell', new THREE.BufferAttribute(cell, 2))
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(cols * rows * 3), 3))
    const mat = new THREE.ShaderMaterial({
      vertexShader: DOT_VERT,
      fragmentShader: DOT_FRAG,
      uniforms: {
        uOffset: shared.uOffset,
        uTime: { value: 0 },
        uSize: { value: DOT_SIZE },
        uPixelRatio: { value: 1 },
        uColor: { value: new THREE.Color(DOT_COLOR) },
      },
      transparent: true,
      depthWrite: false,
    })
    return { geo, mat }
  }, [shared, small])

  useEffect(() => {
    dots.mat.uniforms.uPixelRatio.value = dpr
  }, [dots, dpr])

  useEffect(() => {
    if (!animate) return
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return // touch scrolling shouldn't sway the camera
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [animate])

  useEffect(
    () => () => {
      for (const o of [terrain, dots, sky]) {
        o.geo.dispose()
        o.mat.dispose()
      }
    },
    [terrain, dots, sky],
  )

  useFrame((state, delta) => {
    if (!animate) return
    const dt = Math.min(delta, 0.1)
    shared.uOffset.value += dt * SPEED
    dots.mat.uniforms.uTime.value += dt
    const cam = state.camera
    cam.position.x += (pointer.current.x * PARALLAX - cam.position.x) * Math.min(1, dt * 2)
    cam.position.y += (CAMERA.y - pointer.current.y * PARALLAX * 0.4 - cam.position.y) * Math.min(1, dt * 2)
    cam.lookAt(0, CAMERA.lookY, CAMERA.lookZ)
  })

  return (
    <>
      <mesh geometry={sky.geo} material={sky.mat} renderOrder={-1} frustumCulled={false} />
      <mesh geometry={terrain.geo} material={terrain.mat} frustumCulled={false} />
      <points geometry={dots.geo} material={dots.mat} frustumCulled={false} />
    </>
  )
}

class WebglGuard extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

// True while a full-screen picture viewer is open (it sets data-viewer on <html>), so the landscape stops drawing.
function useViewerOpen() {
  const [open, setOpen] = useState(() => 'viewer' in document.documentElement.dataset)
  useEffect(() => {
    const root = document.documentElement
    const sync = () => setOpen('viewer' in root.dataset)
    const mo = new MutationObserver(sync)
    mo.observe(root, { attributes: true, attributeFilter: ['data-viewer'] })
    return () => mo.disconnect()
  }, [])
  return open
}

// Decorative layer; the panel supplies the black behind it and the dark gradient above it.
export function Landscape() {
  const reduced = useReducedMotion()
  const small = useMemo(isSmall, [])
  const paused = useViewerOpen()
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 bg-black">
      <WebglGuard>
        <Canvas
          resize={{ offsetSize: true }}
          frameloop={reduced || paused ? 'demand' : 'always'}
          dpr={small ? 1 : [1, 1.5]}
          gl={{ antialias: true, alpha: false, powerPreference: 'low-power' }}
          camera={{ fov: CAMERA.fov, near: 0.5, far: 450, position: [0, CAMERA.y, CAMERA.z] }}
          onCreated={({ camera, gl }) => {
            camera.lookAt(0, CAMERA.lookY, CAMERA.lookZ)
            gl.setClearColor('#000000')
          }}
        >
          <Scene animate={!reduced} small={small} />
        </Canvas>
      </WebglGuard>
    </div>
  )
}
