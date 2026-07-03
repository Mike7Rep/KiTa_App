"use client"

import * as React from "react"
import * as THREE from "three"
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js"

const makeRindTexture = () => {
  const canvas = document.createElement("canvas")
  canvas.width = 2048
  canvas.height = 1024
  const g = canvas.getContext("2d")!
  const base = g.createLinearGradient(0, 0, 0, canvas.height)
  base.addColorStop(0, "#14602f")
  base.addColorStop(0.5, "#238747")
  base.addColorStop(1, "#11552a")
  g.fillStyle = base
  g.fillRect(0, 0, canvas.width, canvas.height)
  for (let i = 0; i < 2400; i++) {
    g.fillStyle = `rgba(255,255,255,${Math.random() * 0.04})`
    g.beginPath()
    g.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1 + Math.random() * 7, 0, Math.PI * 2)
    g.fill()
  }
  const stripes = 14
  g.strokeStyle = "rgb(5 54 29)"
  g.lineCap = "round"
  for (let s = 0; s < stripes; s++) {
    const cx = (s + 0.5) * (canvas.width / stripes)
    for (let k = 0; k < 26; k++) {
      g.lineWidth = 30 + Math.random() * 40
      g.globalAlpha = 0.3 + Math.random() * 0.28
      g.beginPath()
      g.moveTo(cx + (Math.random() - 0.5) * 44, -30)
      for (let y = 0; y <= canvas.height + 60; y += 60) g.lineTo(cx + Math.sin(y * 0.012 + s * 2.1 + k * 0.7) * 26 + (Math.random() - 0.5) * 26, y)
      g.stroke()
    }
  }
  g.globalAlpha = 1
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.anisotropy = 8
  return tex
}

const smoothstep = (a: number, b: number, x: number) => {
  const k = Math.min(Math.max((x - a) / (b - a), 0), 1)
  return k * k * (3 - 2 * k)
}
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3)
const easeOutBack = (x: number) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

export function WatermelonSplash({ onDone }: { onDone: () => void }) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.95
    const scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(renderer)
    const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = envMap
    const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.set(0, 0.12, 7.6)
    const fitCamera = () => {
      const vFov = (34 * Math.PI) / 180
      const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect)
      camera.position.z = Math.max(7.2, 2.3 / Math.tan(Math.min(vFov, hFov) / 2))
    }
    fitCamera()
    const key = new THREE.DirectionalLight(0xffffff, 1.6)
    key.position.set(3.5, 4.5, 5)
    scene.add(key)
    const rim = new THREE.PointLight(0xbfffe0, 40, 14)
    rim.position.set(-4.5, 1.6, 3.5)
    scene.add(rim)

    const group = new THREE.Group()
    scene.add(group)
    const rindTex = makeRindTexture()
    const rind = new THREE.MeshPhysicalMaterial({ map: rindTex, roughness: 0.28, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.14, sheen: 0.25, sheenColor: new THREE.Color(0xa7f3c9), envMapIntensity: 0.45 })
    const geo = new THREE.SphereGeometry(1.5, 150, 100)
    const posAttr = geo.getAttribute("position") as THREE.BufferAttribute
    const vertexCount = posAttr.count
    const dirs = new Float32Array(vertexCount * 3)
    for (let i = 0; i < vertexCount; i++) {
      dirs[i * 3] = posAttr.getX(i) / 1.5
      dirs[i * 3 + 1] = posAttr.getY(i) / 1.5
      dirs[i * 3 + 2] = posAttr.getZ(i) / 1.5
    }
    const deform = (t: number, amp: number) => {
      for (let i = 0; i < vertexCount; i++) {
        const nx = dirs[i * 3], ny = dirs[i * 3 + 1], nz = dirs[i * 3 + 2]
        const w = Math.sin(nx * 3.2 + t * 1.3) * 0.5 + Math.sin(ny * 4.1 - t * 1.1) * 0.34 + Math.sin(nz * 2.6 + nx * 2.2 + t * 1.6) * 0.42 + Math.sin((nx + ny + nz) * 4.6 - t * 0.8) * 0.22
        const r = 1.5 * (1 + w * amp)
        posAttr.setXYZ(i, nx * r, ny * r, nz * r)
      }
      posAttr.needsUpdate = true
      geo.computeVertexNormals()
    }
    const melon = new THREE.Mesh(geo, rind)
    group.add(melon)

    const faceMat = new THREE.MeshPhysicalMaterial({ color: 0x131313, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.08, transparent: true, opacity: 0 })
    const cheekMat = new THREE.MeshPhysicalMaterial({ color: 0xff8fa0, roughness: 0.5, transparent: true, opacity: 0 })
    const faceRadius = 1.66
    const surfacePoint = (x: number, y: number) => new THREE.Vector3(x, y, Math.sqrt(Math.max(faceRadius * faceRadius - x * x - y * y, 0.3)))
    const eyes: THREE.Mesh[] = []
    ;[[-0.52, 0.46], [0.52, 0.46]].forEach(([x, y]) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.13, 32, 24), faceMat)
      eye.position.copy(surfacePoint(x, y).setLength(faceRadius))
      eye.lookAt(eye.position.clone().multiplyScalar(2))
      eye.scale.set(0.9, 1.2, 0.45)
      group.add(eye)
      eyes.push(eye)
    })
    ;[[-0.86, -0.02], [0.86, -0.02]].forEach(([x, y]) => {
      const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 16), cheekMat)
      cheek.position.copy(surfacePoint(x, y).setLength(faceRadius - 0.03))
      cheek.lookAt(cheek.position.clone().multiplyScalar(2))
      cheek.scale.set(1, 0.72, 0.3)
      group.add(cheek)
    })
    const smileAnchor = new THREE.Vector3(0, -0.1, faceRadius - 0.04)
    const smilePoints: THREE.Vector3[] = []
    for (let i = 0; i <= 24; i++) {
      const s = i / 24
      const x = (s - 0.5) * 1.14
      const y = -0.2 + Math.pow((s - 0.5) * 2, 2) * 0.36
      smilePoints.push(surfacePoint(x, y).setLength(faceRadius + 0.015).sub(smileAnchor))
    }
    const smileGroup = new THREE.Group()
    smileGroup.position.copy(smileAnchor)
    const smileCurve = new THREE.CatmullRomCurve3(smilePoints)
    smileGroup.add(new THREE.Mesh(new THREE.TubeGeometry(smileCurve, 48, 0.055, 16), faceMat))
    ;[smilePoints[0], smilePoints[smilePoints.length - 1]].forEach((p) => {
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 12), faceMat)
      cap.position.copy(p)
      smileGroup.add(cap)
    })
    group.add(smileGroup)

    let raf = 0
    const start = performance.now()
    const loadedTimer = window.setTimeout(onDone, 5000)
    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight)
      camera.aspect = window.innerWidth / window.innerHeight
      fitCamera()
      camera.updateProjectionMatrix()
    }
    window.addEventListener("resize", onResize)
    const animate = () => {
      const t = (performance.now() - start) / 1000
      const spin = easeOutCubic(Math.min(t / 2.6, 1))
      group.rotation.y = spin * Math.PI * 4
      group.rotation.x = Math.sin(t * 2) * 0.06 * (1 - spin * 0.5)
      group.rotation.z = Math.sin(t * 1.7) * 0.05 * (1 - spin * 0.6)
      group.position.y = Math.sin(t * 2.2) * 0.09 * (1 - spin * 0.5)
      deform(t, 0.2 - 0.13 * smoothstep(1.6, 2.6, t))
      const faceIn = smoothstep(2.35, 2.85, t)
      faceMat.opacity = faceIn
      cheekMat.opacity = faceIn * 0.85
      const grin = easeOutBack(smoothstep(2.9, 3.7, t))
      smileGroup.scale.set(0.45 + 0.55 * grin, 0.2 + 0.8 * grin, 0.6 + 0.4 * grin)
      const blink = Math.max(0, 1 - Math.abs((t - 4.15) / 0.12))
      eyes.forEach((eye) => { eye.scale.y = 1.2 * (1 - 0.88 * blink) })
      group.scale.setScalar(1 + Math.sin(t * 3.1) * 0.02 + faceIn * 0.05)
      renderer.render(scene, camera)
      raf = requestAnimationFrame(animate)
    }
    animate()
    return () => {
      window.clearTimeout(loadedTimer)
      window.removeEventListener("resize", onResize)
      cancelAnimationFrame(raf)
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
          const mat = obj.material
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
          else mat.dispose()
        }
      })
      rindTex.dispose()
      envMap.dispose()
      pmrem.dispose()
      renderer.dispose()
    }
  }, [onDone])
  return <div className="watermelon-splash" aria-label="Three.js Wassermelonen-Blob Intro"><canvas ref={canvasRef} className="watermelon-three-canvas" /><p>Award Winning KiTa</p></div>
}
