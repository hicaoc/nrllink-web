import * as THREE from 'three'
import { removeAndDispose } from '../core/dispose'

const TOWER_HEIGHT = 28

function makeGlyphTexture(char) {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, 32, 32)
  ctx.font = 'bold 24px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#8ff9de'
  ctx.fillText(char, 16, 17)
  return new THREE.CanvasTexture(canvas)
}

// DMR 别墅旁的桁架天线塔:旋转信标 + 向上飘的 0/1 数据粒子
export class AntennaTower {
  constructor(scene, position = new THREE.Vector3()) {
    this.scene = scene
    this.group = new THREE.Group()
    this.group.name = 'antenna-tower'
    this.group.position.copy(position)
    this.time = 0
    this.beacon = null
    this.beaconLight = null
    this.particleSystems = []

    this._buildLattice()
    this._buildBeacon()
    this._buildParticles()

    scene.add(this.group)
  }

  _buildLattice() {
    const material = new THREE.MeshStandardMaterial({ color: 0x9aa7b5, roughness: 0.6, metalness: 0.6 })
    const halfBase = 1.7
    const halfTop = 0.55
    const corners = [
      [-1, -1], [1, -1], [1, 1], [-1, 1]
    ]
    // 4 根立柱,向内收分
    corners.forEach(corner => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.22, TOWER_HEIGHT, 0.22), material)
      const bottomX = corner[0] * halfBase
      const bottomZ = corner[1] * halfBase
      const topX = corner[0] * halfTop
      const topZ = corner[1] * halfTop
      leg.position.set((bottomX + topX) / 2, TOWER_HEIGHT / 2, (bottomZ + topZ) / 2)
      leg.rotation.z = Math.atan2(bottomX - topX, TOWER_HEIGHT)
      leg.rotation.x = -Math.atan2(bottomZ - topZ, TOWER_HEIGHT)
      this.group.add(leg)
    })
    // 横杆
    const rungCount = 9
    for (let i = 1; i <= rungCount; i++) {
      const y = (TOWER_HEIGHT / (rungCount + 1)) * i
      const half = halfBase + (halfTop - halfBase) * (y / TOWER_HEIGHT)
      const rungX = new THREE.Mesh(new THREE.BoxGeometry(half * 2, 0.12, 0.12), material)
      rungX.position.set(0, y, half)
      this.group.add(rungX)
      const rungX2 = rungX.clone()
      rungX2.position.z = -half
      this.group.add(rungX2)
      const rungZ = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, half * 2), material)
      rungZ.position.set(half, y, 0)
      this.group.add(rungZ)
      const rungZ2 = rungZ.clone()
      rungZ2.position.x = -half
      this.group.add(rungZ2)
    }
    // 顶部天线桅杆
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 6, 6), material)
    mast.position.y = TOWER_HEIGHT + 3
    this.group.add(mast)
  }

  _buildBeacon() {
    this.beacon = new THREE.Group()
    this.beacon.position.y = TOWER_HEIGHT + 6.2
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.12, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x5b6470, roughness: 0.6, metalness: 0.5 })
    )
    this.beacon.add(arm)
    this.beaconLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0xff3b30, emissive: 0xff3b30, emissiveIntensity: 2 })
    )
    this.beaconLight.position.x = 1.1
    this.beacon.add(this.beaconLight)
    const tail = this.beaconLight.clone()
    tail.position.x = -1.1
    this.beacon.add(tail)
    this.group.add(this.beacon)
  }

  _buildParticles() {
    // 两列粒子分别显示 '0' 与 '1'
    const perSystem = 26
    const chars = ['0', '1']
    chars.forEach((char, systemIndex) => {
      const geometry = new THREE.BufferGeometry()
      const positions = new Float32Array(perSystem * 3)
      const params = []
      for (let i = 0; i < perSystem; i++) {
        const param = this._spawnParticle({})
        params.push(param)
        positions[i * 3] = param.x
        positions[i * 3 + 1] = param.y
        positions[i * 3 + 2] = param.z
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      const material = new THREE.PointsMaterial({
        size: 1.7,
        map: makeGlyphTexture(char),
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        color: 0x8ff9de
      })
      const points = new THREE.Points(geometry, material)
      points.name = `data-particles-${systemIndex}`
      this.group.add(points)
      this.particleSystems.push({ points, params })
    })
  }

  _spawnParticle(param) {
    param.x = (Math.random() - 0.5) * 3.5
    param.z = (Math.random() - 0.5) * 3.5
    param.y = TOWER_HEIGHT * Math.random()
    param.speed = 3 + Math.random() * 4
    param.drift = Math.random() * Math.PI * 2
    return param
  }

  update(dt) {
    this.time += dt

    // 顶部信标旋转 + 闪烁
    if (this.beacon) {
      this.beacon.rotation.y += dt * 1.4
    }
    if (this.beaconLight) {
      this.beaconLight.material.emissiveIntensity = 1.4 + Math.sin(this.time * 5) * 1.1
    }

    // 0/1 粒子沿塔身上飘,到顶后回到底部
    this.particleSystems.forEach(system => {
      const attr = system.points.geometry.attributes.position
      system.params.forEach((param, i) => {
        param.y += param.speed * dt
        if (param.y > TOWER_HEIGHT + 7) {
          this._spawnParticle(param)
          param.y = 0
        }
        attr.setXYZ(
          i,
          param.x + Math.sin(this.time + param.drift) * 0.4,
          param.y,
          param.z + Math.cos(this.time * 0.8 + param.drift) * 0.4
        )
      })
      attr.needsUpdate = true
    })
  }

  dispose() {
    removeAndDispose(this.group)
    this.beacon = null
    this.beaconLight = null
    this.particleSystems = []
  }
}
