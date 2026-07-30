import * as THREE from 'three'
import { UNIVERSE_CONFIG } from '@/config/universe'
import { makeLabelSprite } from '../core/label'
import { removeAndDispose } from '../core/dispose'

const DEFAULT_FIBER_COLORS = ['#ff6b6b', '#ffd166', '#37d67a', '#36f0cb', '#3f8dff', '#c3a6ff']
const BM_CLOUD_POSITION = new THREE.Vector3(-40, 110, -260)

const FIBER_VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const FIBER_FRAGMENT_SHADER = `
  uniform float uTime;
  uniform float uPulse;
  uniform float uSpeed;
  uniform vec3 uColors[6];
  varying vec2 vUv;

  vec3 fiberColor(float t) {
    float x = fract(t) * 5.0;
    vec3 c = uColors[0];
    c = mix(c, uColors[1], clamp(x, 0.0, 1.0));
    c = mix(c, uColors[2], clamp(x - 1.0, 0.0, 1.0));
    c = mix(c, uColors[3], clamp(x - 2.0, 0.0, 1.0));
    c = mix(c, uColors[4], clamp(x - 3.0, 0.0, 1.0));
    c = mix(c, uColors[5], clamp(x - 4.0, 0.0, 1.0));
    return c;
  }

  void main() {
    vec3 base = fiberColor(vUv.x);
    // 时间驱动的流动亮带
    float flow = fract(vUv.x * 3.0 - uTime * uSpeed);
    float band = smoothstep(0.0, 0.08, flow) * smoothstep(0.32, 0.1, flow);
    // 程序化条纹模拟数字流
    float digits = step(0.62, fract(vUv.x * 48.0 - uTime * uSpeed * 4.0)) * 0.35;
    float brightness = 0.55 + band * 1.6 + digits + uPulse * 1.4;
    vec3 color = base * brightness;
    gl_FragColor = vec4(color, 0.9);
  }
`

function fiberColorsFromConfig() {
  const configured = UNIVERSE_CONFIG && UNIVERSE_CONFIG.fiberColors
  const list = Array.isArray(configured) && configured.length >= 6 ? configured : DEFAULT_FIBER_COLORS
  return list.slice(0, 6).map(hex => new THREE.Color(hex))
}

export class FiberNetwork {
  constructor(scene, quality = 'high') {
    this.scene = scene
    this.quality = quality
    this.group = new THREE.Group()
    this.group.name = 'fiber-network'
    this.time = 0
    this.pulseStrength = 0
    this.materials = []
    this.lastBuild = null
    scene.add(this.group)
  }

  // dmrPosition 为 null 时不建光纤;targets: [{ position: Vector3, speed: number }]
  build(dmrPosition, targets = [], bmPosition = BM_CLOUD_POSITION) {
    this._clear()
    this.lastBuild = dmrPosition ? { dmrPosition: dmrPosition.clone(), targets, bmPosition: bmPosition.clone() } : null
    if (!dmrPosition) {
      return
    }

    const colors = fiberColorsFromConfig()
    const segments = this.quality === 'low' ? 48 : 120
    const links = targets.map(target => {
      return { to: target.position, speed: target.speed || 0.6 }
    })
    links.push({ to: bmPosition, speed: 1.2, isBm: true })

    links.forEach(link => {
      const from = dmrPosition.clone().add(new THREE.Vector3(0, link.isBm ? 16 : 9, 0))
      const to = link.to.clone().add(new THREE.Vector3(0, link.isBm ? 0 : 9, 0))
      const distance = from.distanceTo(to)
      const mid1 = from.clone().lerp(to, 0.33).add(new THREE.Vector3(0, distance * 0.22 + 8, distance * 0.05))
      const mid2 = from.clone().lerp(to, 0.66).add(new THREE.Vector3(0, distance * 0.22 + 8, -distance * 0.05))
      const curve = new THREE.CatmullRomCurve3([from, mid1, mid2, to])
      const geometry = new THREE.TubeGeometry(curve, segments, 0.22, 6, false)
      const material = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uPulse: { value: 0 },
          uSpeed: { value: link.speed },
          uColors: { value: colors }
        },
        vertexShader: FIBER_VERTEX_SHADER,
        fragmentShader: FIBER_FRAGMENT_SHADER
      })
      this.materials.push(material)
      const tube = new THREE.Mesh(geometry, material)
      tube.name = link.isBm ? 'fiber-bm' : 'fiber-link'
      this.group.add(tube)
    })

    this._buildBmCloud(bmPosition)
  }

  _buildBmCloud(position) {
    const cloud = new THREE.Group()
    cloud.name = 'bm-cloud'
    const puffGeometry = new THREE.SphereGeometry(9, 16, 12)
    const puffMaterial = new THREE.MeshBasicMaterial({
      color: 0x7fd8ff,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    const puffs = [
      [0, 0, 0, 1], [-8, -1, 2, 0.7], [8, -2, -1, 0.75], [3, 4, 3, 0.55]
    ]
    puffs.forEach(p => {
      const puff = new THREE.Mesh(puffGeometry, puffMaterial)
      puff.position.set(p[0], p[1], p[2])
      puff.scale.setScalar(p[3])
      cloud.add(puff)
    })
    const label = makeLabelSprite([{ text: 'BM Network', color: '#7fd8ff' }], { scale: 0.16 })
    label.position.set(0, 14, 0)
    cloud.add(label)
    cloud.position.copy(position)
    this.bmCloud = cloud
    this.group.add(cloud)
  }

  _clear() {
    while (this.group.children.length) {
      removeAndDispose(this.group.children[0])
    }
    this.materials = []
    this.bmCloud = null
  }

  // 全网光纤脉冲 2 秒
  pulse() {
    this.pulseStrength = 1
  }

  setQuality(quality) {
    if (this.quality === quality) return
    this.quality = quality
    if (this.lastBuild) {
      const { dmrPosition, targets, bmPosition } = this.lastBuild
      this.build(dmrPosition, targets, bmPosition)
    }
  }

  update(dt) {
    this.time += dt
    // 脉冲强度在约 2 秒内衰减
    this.pulseStrength = Math.max(0, this.pulseStrength - dt / 2)
    this.materials.forEach(material => {
      material.uniforms.uTime.value = this.time
      material.uniforms.uPulse.value = this.pulseStrength
    })
    if (this.bmCloud) {
      this.bmCloud.rotation.y += dt * 0.05
    }
  }

  dispose() {
    this._clear()
    removeAndDispose(this.group)
    this.lastBuild = null
  }
}
