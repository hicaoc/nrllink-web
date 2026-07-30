import * as THREE from 'three'
import { UNIVERSE_CONFIG } from '@/config/universe'
import { removeAndDispose } from '../core/dispose'

const QUALITY_COUNTS = {
  high: { trees: 140, flowers: 220, birds: 26, groundSegments: 72 },
  low: { trees: 48, flowers: 80, birds: 12, groundSegments: 40 }
}

const WORLD_SIZE = 420
const STREAM = UNIVERSE_CONFIG.stream
const WATER_X = STREAM.centerX
const WATER_WIDTH = STREAM.width

// 蜿蜒小溪的中心线(东方小桥流水)
export function streamX(z) {
  return STREAM.centerX + Math.sin(z * STREAM.freq) * STREAM.bend
}

// 确定性伪随机,保证多次生成的地形一致
function pseudoRandom(x, z) {
  const s = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453
  return s - Math.floor(s)
}

// 山谷地形高度:中央平坦,四周隆起
export function terrainHeight(x, z) {
  const dist = Math.sqrt(x * x + z * z)
  const lift = THREE.MathUtils.smoothstep(dist, 46, 180)
  const noise = pseudoRandom(Math.floor(x / 16), Math.floor(z / 16))
  return lift * (5 + noise * 24)
}

function randomGroundPosition(minRadius, maxRadius) {
  const angle = Math.random() * Math.PI * 2
  const radius = minRadius + Math.random() * (maxRadius - minRadius)
  return { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius }
}

export class Terrain {
  constructor(scene, quality = 'high') {
    this.scene = scene
    this.quality = QUALITY_COUNTS[quality] ? quality : 'high'
    this.group = new THREE.Group()
    this.group.name = 'terrain'
    this.time = 0
    this.waterMesh = null
    this.waterBasePositions = null
    this.birds = null
    this.birdParams = []

    this._buildSky()
    this._buildGround()
    this._buildWater()
    this._buildBridge()
    this._buildVegetation()
    this._buildMountains()
    this._buildBirds()

    scene.add(this.group)
  }

  _buildSky() {
    const geometry = new THREE.SphereGeometry(620, 24, 16)
    const material = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        uTopColor: { value: new THREE.Color(0x6fb7ff) },
        uHorizonColor: { value: new THREE.Color(0xffdfc2) },
        uBottomColor: { value: new THREE.Color(0xbfe3d8) }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uTopColor;
        uniform vec3 uHorizonColor;
        uniform vec3 uBottomColor;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition).y;
          vec3 color = h > 0.0
            ? mix(uHorizonColor, uTopColor, pow(h, 0.6))
            : mix(uHorizonColor, uBottomColor, pow(-h, 0.5));
          gl_FragColor = vec4(color, 1.0);
        }
      `
    })
    const sky = new THREE.Mesh(geometry, material)
    sky.name = 'sky'
    this.group.add(sky)
  }

  _buildGround() {
    const segments = QUALITY_COUNTS[this.quality].groundSegments
    const geometry = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, segments, segments)
    geometry.rotateX(-Math.PI / 2)

    const positions = geometry.attributes.position
    const colors = new Float32Array(positions.count * 3)
    const grassLow = new THREE.Color(0x58a75c)
    const grassHigh = new THREE.Color(0x8fd07a)
    const rock = new THREE.Color(0x93a39b)
    const snow = new THREE.Color(0xf2f7fa)
    const riverbed = new THREE.Color(0xcbbd93)
    const color = new THREE.Color()

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const z = positions.getZ(i)
      let y = terrainHeight(x, z)
      // 沿小溪下切河道(小桥流水)
      const streamDist = Math.abs(x - streamX(z))
      const inStream = streamDist < WATER_WIDTH / 2 + 5
      if (inStream) {
        y = Math.min(y, -0.6 + (streamDist / (WATER_WIDTH / 2 + 5)) * 2.0)
      }
      positions.setY(i, y)

      if (inStream) {
        color.copy(riverbed)
      } else if (y > 20) {
        color.copy(snow)
      } else if (y > 11) {
        color.copy(rock).lerp(snow, (y - 11) / 9)
      } else {
        const n = pseudoRandom(x * 0.7, z * 0.7)
        color.copy(grassLow).lerp(grassHigh, n)
      }
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.computeVertexNormals()

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      flatShading: true,
      roughness: 0.95,
      metalness: 0
    })
    const ground = new THREE.Mesh(geometry, material)
    ground.name = 'ground'
    this.group.add(ground)
  }

  _buildWater() {
    const geometry = new THREE.PlaneGeometry(WATER_WIDTH, WORLD_SIZE, 6, 64)
    geometry.rotateX(-Math.PI / 2)
    // 蜿蜒溪流:顶点 x 沿 z 正弦偏移(与 streamX 河道一致)
    const posAttr = geometry.attributes.position
    for (let i = 0; i < posAttr.count; i++) {
      const z = posAttr.getZ(i)
      posAttr.setX(i, posAttr.getX(i) + Math.sin(z * STREAM.freq) * STREAM.bend)
    }
    const material = new THREE.MeshStandardMaterial({
      color: 0x53b7c6,
      transparent: true,
      opacity: 0.66,
      roughness: 0.15,
      metalness: 0.2,
      emissive: 0x1a4a52,
      emissiveIntensity: 0.35
    })
    const water = new THREE.Mesh(geometry, material)
    water.position.set(WATER_X, 0.3, 0)
    water.name = 'water'
    this.waterMesh = water
    this.waterBasePositions = Float32Array.from(geometry.attributes.position.array)
    this.group.add(water)
  }

  // 东方石拱桥:跨过小溪,两端挂红灯笼
  _buildBridge() {
    const bridge = new THREE.Group()
    bridge.name = 'stream-bridge'
    const stone = new THREE.MeshStandardMaterial({ color: 0xd8d0bd, flatShading: true, roughness: 0.9 })
    const stoneDark = new THREE.MeshStandardMaterial({ color: 0xb0a488, flatShading: true, roughness: 0.95 })

    const span = WATER_WIDTH + 12
    const steps = 9
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1)
      const x = (t - 0.5) * span
      const h = Math.sin(t * Math.PI) * 2.2
      const step = new THREE.Mesh(new THREE.BoxGeometry(span / steps + 0.4, 0.5, 3.6), stone)
      step.position.set(x, 1.15 + h, 0)
      bridge.add(step)
      for (const side of [-1.9, 1.9]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.26, 1.1, 0.26), stoneDark)
        post.position.set(x, 1.15 + h + 0.8, side)
        bridge.add(post)
      }
    }
    // 两侧弧形扶手
    for (const side of [-1.9, 1.9]) {
      const rail = new THREE.Mesh(new THREE.TorusGeometry(span / 2, 0.12, 6, 32, Math.PI), stoneDark)
      rail.scale.set(1, 0.16, 1)
      rail.position.set(0, 1.75, side)
      bridge.add(rail)
    }
    // 桥头红灯笼
    const lanternMaterial = new THREE.MeshStandardMaterial({
      color: 0xff4d42,
      emissive: 0xff2d20,
      emissiveIntensity: 1.6
    })
    for (const endX of [-span / 2 - 1.6, span / 2 + 1.6]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 3.4, 6), stoneDark)
      pole.position.set(endX, 1.7, 0)
      bridge.add(pole)
      const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), lanternMaterial)
      lantern.scale.set(1, 1.25, 1)
      lantern.position.set(endX, 3.7, 0)
      bridge.add(lantern)
    }

    // 桥位于 z=0 处的小溪上(streamX(0) = WATER_X)
    bridge.position.set(WATER_X, 0, 0)
    this.group.add(bridge)
  }

  _buildVegetation() {
    const counts = QUALITY_COUNTS[this.quality]
    const dummy = new THREE.Object3D()

    const trunkGeometry = new THREE.CylinderGeometry(0.32, 0.5, 3, 5)
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x6b4a2f, flatShading: true, roughness: 1 })
    const trunks = new THREE.InstancedMesh(trunkGeometry, trunkMaterial, counts.trees)

    const foliageGeometry = new THREE.ConeGeometry(2.3, 6.4, 6)
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x2f7a3d, flatShading: true, roughness: 1 })
    const foliage = new THREE.InstancedMesh(foliageGeometry, foliageMaterial, counts.trees)

    const foliageColor = new THREE.Color()
    let placed = 0
    let guard = 0
    while (placed < counts.trees && guard < counts.trees * 20) {
      guard++
      const { x, z } = randomGroundPosition(42, WORLD_SIZE / 2 - 24)
      // 避开河道
      if (Math.abs(x - streamX(z)) < WATER_WIDTH / 2 + 6) continue
      const y = terrainHeight(x, z)
      const scale = 0.7 + Math.random() * 0.9

      dummy.position.set(x, y + 1.5 * scale, z)
      dummy.scale.setScalar(scale)
      dummy.rotation.y = Math.random() * Math.PI
      dummy.updateMatrix()
      trunks.setMatrixAt(placed, dummy.matrix)

      dummy.position.set(x, y + (3 + 3.2) * scale - 1.5 * scale, z)
      dummy.updateMatrix()
      foliage.setMatrixAt(placed, dummy.matrix)
      foliageColor.setHSL(0.3 + Math.random() * 0.08, 0.55, 0.38 + Math.random() * 0.16)
      foliage.setColorAt(placed, foliageColor)

      placed++
    }
    trunks.count = placed
    foliage.count = placed
    trunks.instanceMatrix.needsUpdate = true
    foliage.instanceMatrix.needsUpdate = true
    if (foliage.instanceColor) foliage.instanceColor.needsUpdate = true
    trunks.name = 'trees-trunk'
    foliage.name = 'trees-foliage'
    this.group.add(trunks)
    this.group.add(foliage)
    this.treePairs = [[trunks, foliage]]

    // 樱花树(东方元素,粉色球形树冠)
    const cherryCount = Math.max(4, Math.floor(counts.trees * 0.35))
    const cherryTrunks = new THREE.InstancedMesh(trunkGeometry, trunkMaterial, cherryCount)
    const cherryGeometry = new THREE.IcosahedronGeometry(2.4, 0)
    const cherryMaterial = new THREE.MeshStandardMaterial({ color: 0xf4aecb, flatShading: true, roughness: 1 })
    const cherries = new THREE.InstancedMesh(cherryGeometry, cherryMaterial, cherryCount)
    const cherryColor = new THREE.Color()
    let cPlaced = 0
    guard = 0
    while (cPlaced < cherryCount && guard < cherryCount * 20) {
      guard++
      const { x, z } = randomGroundPosition(30, WORLD_SIZE / 2 - 30)
      if (Math.abs(x - streamX(z)) < WATER_WIDTH / 2 + 6) continue
      const y = terrainHeight(x, z)
      const scale = 0.7 + Math.random() * 0.7

      dummy.position.set(x, y + 1.5 * scale, z)
      dummy.scale.setScalar(scale)
      dummy.rotation.y = Math.random() * Math.PI
      dummy.updateMatrix()
      cherryTrunks.setMatrixAt(cPlaced, dummy.matrix)

      dummy.position.set(x, y + (3 + 2.2) * scale - 1.5 * scale, z)
      dummy.scale.setScalar(scale * 1.15)
      dummy.updateMatrix()
      cherries.setMatrixAt(cPlaced, dummy.matrix)
      cherryColor.setHSL(0.92 + Math.random() * 0.04, 0.62, 0.72 + Math.random() * 0.1)
      cherries.setColorAt(cPlaced, cherryColor)

      cPlaced++
    }
    cherryTrunks.count = cPlaced
    cherries.count = cPlaced
    cherryTrunks.instanceMatrix.needsUpdate = true
    cherries.instanceMatrix.needsUpdate = true
    if (cherries.instanceColor) cherries.instanceColor.needsUpdate = true
    cherryTrunks.name = 'cherry-trunk'
    cherries.name = 'cherry-foliage'
    this.group.add(cherryTrunks)
    this.group.add(cherries)
    this.treePairs.push([cherryTrunks, cherries])

    const flowerGeometry = new THREE.SphereGeometry(0.22, 6, 5)
    const flowerMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const flowers = new THREE.InstancedMesh(flowerGeometry, flowerMaterial, counts.flowers)
    const flowerPalette = [0xff8fb2, 0xffd166, 0xfff4f0, 0xc3a6ff, 0xff6b6b, 0xffa94d]
    const flowerColor = new THREE.Color()
    let fPlaced = 0
    let fGuard = 0
    while (fPlaced < counts.flowers && fGuard < counts.flowers * 20) {
      fGuard++
      const { x, z } = randomGroundPosition(14, 120)
      if (Math.abs(x - streamX(z)) < WATER_WIDTH / 2 + 4) continue
      const y = terrainHeight(x, z)
      dummy.position.set(x, y + 0.25, z)
      dummy.scale.setScalar(0.7 + Math.random() * 0.8)
      dummy.rotation.set(0, 0, 0)
      dummy.updateMatrix()
      flowers.setMatrixAt(fPlaced, dummy.matrix)
      flowerColor.setHex(flowerPalette[fPlaced % flowerPalette.length])
      flowers.setColorAt(fPlaced, flowerColor)
      fPlaced++
    }
    flowers.count = fPlaced
    flowers.instanceMatrix.needsUpdate = true
    if (flowers.instanceColor) flowers.instanceColor.needsUpdate = true
    flowers.name = 'flowers'
    this.group.add(flowers)
  }

  _buildMountains() {
    const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x86a3ad, flatShading: true, roughness: 1 })
    const snowMaterial = new THREE.MeshStandardMaterial({ color: 0xf2f8fc, flatShading: true, roughness: 0.9 })
    const ridge = [
      { x: -180, z: -240, r: 90, h: 120 },
      { x: 40, z: -280, r: 120, h: 150 },
      { x: 240, z: -220, r: 95, h: 110 },
      { x: -280, z: -60, r: 80, h: 95 },
      { x: 290, z: 40, r: 85, h: 100 }
    ]
    ridge.forEach(m => {
      const rock = new THREE.Mesh(new THREE.ConeGeometry(m.r, m.h, 5), rockMaterial)
      rock.position.set(m.x, m.h / 2 - 4, m.z)
      rock.rotation.y = pseudoRandom(m.x, m.z) * Math.PI
      this.group.add(rock)

      const cap = new THREE.Mesh(new THREE.ConeGeometry(m.r * 0.42, m.h * 0.42, 5), snowMaterial)
      cap.position.set(m.x, m.h * 0.79 - 4, m.z)
      cap.rotation.y = rock.rotation.y
      this.group.add(cap)
    })
  }

  _buildBirds() {
    const count = QUALITY_COUNTS[this.quality].birds
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const material = new THREE.PointsMaterial({
      color: 0xfff4e0,
      size: 1.6,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9
    })
    this.birds = new THREE.Points(geometry, material)
    this.birds.name = 'birds'
    this.birdParams = []
    for (let i = 0; i < count; i++) {
      this.birdParams.push({
        cx: (Math.random() - 0.5) * 160,
        cz: (Math.random() - 0.5) * 160,
        radius: 30 + Math.random() * 90,
        height: 34 + Math.random() * 40,
        speed: 0.08 + Math.random() * 0.12,
        phase: Math.random() * Math.PI * 2
      })
    }
    this.group.add(this.birds)
  }

  // 清除别墅院落周边的树木,避免挡住院门/影响通行
  clearVegetationNear(points, radius = 17) {
    if (!Array.isArray(points) || !points.length || !this.treePairs) return
    const m = new THREE.Matrix4()
    // 移到场外远处并缩到极小(不能只缩放到 0 平移,否则实例全堆在原点)
    const hidden = new THREE.Matrix4()
      .makeTranslation(10000, -100, 10000)
      .scale(new THREE.Vector3(0.0001, 0.0001, 0.0001))
    this.treePairs.forEach(([trunkMesh, canopyMesh]) => {
      if (!trunkMesh || !canopyMesh) return
      const count = trunkMesh.count
      for (let i = 0; i < count; i++) {
        trunkMesh.getMatrixAt(i, m)
        const x = m.elements[12]
        const z = m.elements[14]
        const near = points.some(p => {
          const dx = x - p.x
          const dz = z - p.z
          return dx * dx + dz * dz < radius * radius
        })
        if (near) {
          trunkMesh.setMatrixAt(i, hidden)
          canopyMesh.setMatrixAt(i, hidden)
        }
      }
      trunkMesh.instanceMatrix.needsUpdate = true
      canopyMesh.instanceMatrix.needsUpdate = true
    })
  }

  update(dt) {
    this.time += dt

    // 水面顶点波动
    if (this.waterMesh && this.waterBasePositions) {
      const attr = this.waterMesh.geometry.attributes.position
      for (let i = 0; i < attr.count; i++) {
        const baseX = this.waterBasePositions[i * 3]
        const baseZ = this.waterBasePositions[i * 3 + 2]
        const wave = Math.sin(this.time * 1.6 + baseX * 0.35 + baseZ * 0.18) * 0.35
        attr.setY(i, wave)
      }
      attr.needsUpdate = true
    }

    // 飞鸟沿环形航线移动
    if (this.birds) {
      const attr = this.birds.geometry.attributes.position
      for (let i = 0; i < this.birdParams.length; i++) {
        const bird = this.birdParams[i]
        const angle = this.time * bird.speed + bird.phase
        attr.setXYZ(
          i,
          bird.cx + Math.cos(angle) * bird.radius,
          bird.height + Math.sin(this.time * 1.8 + bird.phase) * 1.6,
          bird.cz + Math.sin(angle) * bird.radius
        )
      }
      attr.needsUpdate = true
    }
  }

  dispose() {
    removeAndDispose(this.group)
    this.waterMesh = null
    this.waterBasePositions = null
    this.birds = null
    this.birdParams = []
  }
}
