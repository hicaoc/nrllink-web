import * as THREE from 'three'
import { UNIVERSE_CONFIG, deviceMeshPreset } from '@/config/universe'
import { makeLabelSprite, makeTextTexture } from '../core/label'

const ROOM_STYLE_FALLBACK = { color: '#3f8dff', emissive: '#3f8dff', label: '房间' }

function onlineRatio(platform) {
  const total = Number(platform && platform.total) || 0
  const online = Number(platform && platform.online) || 0
  return total > 0 ? online / total : 0
}

// 窗户颜色:离线暖灰 → 在线暖橙 → 高峰金(暖色灯光,避免阴冷感)
function windowColorByRatio(ratio) {
  const color = new THREE.Color(0x8a8577)
  if (ratio > 0) {
    color.setHex(0xffc46b).lerp(new THREE.Color(0xffe3a3), Math.min(ratio * 1.4, 1))
  }
  if (ratio >= 0.8) {
    color.setHex(0xffd166)
  }
  return color
}

function standardMaterial(color, extra = {}) {
  const material = new THREE.MeshStandardMaterial({
    color,
    flatShading: true,
    roughness: 0.85,
    metalness: 0.05,
    ...extra,
  })
  material.userData.origEmissive = material.emissive.getHex()
  material.userData.origEmissiveIntensity = material.emissiveIntensity
  return material
}

// 生成一栋别墅,platform = { id, name, host, online, total, isDmr, position }
export function buildVilla(platform) {
  const group = new THREE.Group()
  group.name = `villa-${platform.id}`
  const ratio = onlineRatio(platform)
  const highlightables = []

  // 未来乡村配色:暖白墙面 + 石材基座 + 东方青瓦(DMR 为青白未来风,当前服务器金瓦)
  const baseMaterial = standardMaterial(0xcfc6b2)
  const bodyMaterial = standardMaterial(platform.isDmr ? 0xe3f2f4 : 0xf2e8d5)
  const upperMaterial = standardMaterial(platform.isDmr ? 0xd2eaee : 0xe9dcc3)
  const roofMaterial = standardMaterial(
    platform.isCurrent ? 0xd9a441 : platform.isDmr ? 0x2fa8b8 : 0x2e8f84
  )
  highlightables.push(baseMaterial, bodyMaterial, upperMaterial, roofMaterial)

  // 低矮台基(收进院墙内,不外露)
  const base = new THREE.Mesh(new THREE.BoxGeometry(13.5, 1.2, 11.5), baseMaterial)
  base.position.y = 0.6
  group.add(base)

  // 东方院墙:白墙 + 灰瓦压顶,围合出院落
  const wallMaterial = standardMaterial(0xf5f1e6)
  const copingMaterial = standardMaterial(0x5a6670)
  highlightables.push(wallMaterial, copingMaterial)
  const WALL_H = 2.3
  const WALL_T = 0.4
  const YARD = { x: 10.5, zBack: -8, zFront: 13 }
  const addWall = (w, d, x, z) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, WALL_H, d), wallMaterial)
    wall.position.set(x, WALL_H / 2, z)
    group.add(wall)
    const cap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, 0.35, d + 0.3), copingMaterial)
    cap.position.set(x, WALL_H + 0.17, z)
    group.add(cap)
  }
  // 后墙与两侧墙
  addWall(YARD.x * 2 + WALL_T, WALL_T, 0, YARD.zBack)
  addWall(WALL_T, YARD.zFront - YARD.zBack + WALL_T, -YARD.x, (YARD.zFront + YARD.zBack) / 2)
  addWall(WALL_T, YARD.zFront - YARD.zBack + WALL_T, YARD.x, (YARD.zFront + YARD.zBack) / 2)
  // 前墙(中间留 3.6 宽院门)
  const segW = YARD.x - 1.8
  addWall(segW, WALL_T, -(1.8 + segW / 2), YARD.zFront)
  addWall(segW, WALL_T, 1.8 + segW / 2, YARD.zFront)
  // 院门:双柱 + 青瓦门楼
  const gatePillarMaterial = standardMaterial(0xe9e2d2)
  highlightables.push(gatePillarMaterial)
  ;[-1.8, 1.8].forEach((x) => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.7, 3.4, 0.7), gatePillarMaterial)
    pillar.position.set(x, 1.7, YARD.zFront)
    group.add(pillar)
  })
  const gateRoof = new THREE.Mesh(new THREE.ConeGeometry(3.6, 1.2, 4), roofMaterial)
  gateRoof.position.set(0, 3.9, YARD.zFront)
  gateRoof.rotation.y = Math.PI / 4
  gateRoof.scale.set(1, 1, 0.6)
  group.add(gateRoof)

  // 一层体块
  const floor1 = new THREE.Mesh(new THREE.BoxGeometry(12.5, 4.2, 10.5), bodyMaterial)
  floor1.position.y = 3.3
  group.add(floor1)

  // 墙角立柱(装饰线条)
  const pilasterMaterial = standardMaterial(0xfaf5ea)
  highlightables.push(pilasterMaterial)
  ;[
    [-6.05, -5.05],
    [-6.05, 5.05],
    [6.05, -5.05],
    [6.05, 5.05],
  ].forEach(([x, z]) => {
    const pilaster = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4.2, 0.5), pilasterMaterial)
    pilaster.position.set(x, 3.3, z)
    group.add(pilaster)
  })

  // 二层体块
  const floor2 = new THREE.Mesh(new THREE.BoxGeometry(9.5, 3.6, 8.5), upperMaterial)
  floor2.position.set(0.8, 7.2, -0.4)
  group.add(floor2)

  // 坡屋顶(四棱锥)
  const roof = new THREE.Mesh(new THREE.ConeGeometry(7.6, 3.6, 4), roofMaterial)
  roof.position.set(0.8, 10.8, -0.4)
  roof.rotation.y = Math.PI / 4
  roof.scale.set(1, 1, 0.86)
  group.add(roof)

  // 东方挑檐(屋檐裙边)
  const eaveMaterial = standardMaterial(platform.isDmr ? 0x2792a4 : 0x277a71)
  const eave = new THREE.Mesh(new THREE.ConeGeometry(9.6, 1.15, 4), eaveMaterial)
  eave.position.set(0.8, 9.45, -0.4)
  eave.rotation.y = Math.PI / 4
  eave.scale.set(1, 1, 0.86)
  group.add(eave)
  highlightables.push(eaveMaterial)

  if (platform.isDmr) {
    // DMR 别墅:屋顶平台上的发光天线基座
    const mastMaterial = standardMaterial(0x3a4a5c)
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.34, 4.6, 6), mastMaterial)
    mast.position.set(2.0, 15.17, -1.4)
    group.add(mast)
    highlightables.push(mastMaterial)

    const beaconMaterial = new THREE.MeshStandardMaterial({
      color: 0x36f0cb,
      emissive: 0x36f0cb,
      emissiveIntensity: 1.8,
    })
    const beacon = new THREE.Mesh(new THREE.IcosahedronGeometry(0.65, 0), beaconMaterial)
    beacon.position.set(2.0, 17.8, -1.4)
    group.add(beacon)
  } else {
    const chimneyMaterial = standardMaterial(0x7a5240)
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.6, 1.1), chimneyMaterial)
    chimney.position.set(3.4, 11.6, 1.4)
    group.add(chimney)
    highlightables.push(chimneyMaterial)
  }

  // 木门
  const doorMaterial = standardMaterial(0x8a5a3b)
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.8, 0.3), doorMaterial)
  door.position.set(0, 2.6, 5.4)
  group.add(door)

  // 门廊:双圆柱 + 雨棚 + 三级台阶
  const porchMaterial = standardMaterial(0xf5f1e6)
  highlightables.push(porchMaterial)
  ;[-1.5, 1.5].forEach((x) => {
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 2.9, 8), porchMaterial)
    column.position.set(x, 2.65, 6.5)
    group.add(column)
  })
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.22, 1.8), roofMaterial)
  canopy.position.set(0, 4.25, 6.2)
  group.add(canopy)
  ;[
    [1.05, 5.9, 0.3],
    [0.72, 6.45, 0.36],
    [0.38, 7.0, 0.45],
  ].forEach(([y, z, h]) => {
    const step = new THREE.Mesh(new THREE.BoxGeometry(3.0, h, 0.7), porchMaterial)
    step.position.set(0, y, z)
    group.add(step)
  })

  // 门口红灯笼一对(东方元素)
  const lanternMaterial = new THREE.MeshStandardMaterial({
    color: 0xff4d42,
    emissive: 0xff2d20,
    emissiveIntensity: 1.5,
  })
  lanternMaterial.userData.origEmissive = lanternMaterial.emissive.getHex()
  lanternMaterial.userData.origEmissiveIntensity = lanternMaterial.emissiveIntensity
  ;[-1.7, 1.7].forEach((x) => {
    const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), lanternMaterial)
    lantern.scale.set(1, 1.2, 1)
    lantern.position.set(x, 3.5, 5.65)
    group.add(lantern)
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.16, 8), doorMaterial)
    cap.position.set(x, 4.1, 5.65)
    group.add(cap)
  })
  highlightables.push(lanternMaterial)

  // 门前石板路(从院门直通屋门)
  const pathMaterial = standardMaterial(0xd8d0bd)
  ;[6.8, 9.1, 11.4].forEach((z) => {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.24, 1.9), pathMaterial)
    slab.position.set(0, 0.2, z)
    group.add(slab)
  })

  // 院落点缀:灌木与湖石
  const bushMaterial = standardMaterial(0x4c8f4a)
  const rockeryMaterial = standardMaterial(0x9aa5a0)
  highlightables.push(bushMaterial, rockeryMaterial)
  ;[
    [-7.2, 8.5],
    [7.2, 8.5],
    [-7.2, -3.5],
    [7.2, -3.5],
  ].forEach(([x, z]) => {
    const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 0), bushMaterial)
    bush.position.set(x, 0.7, z)
    group.add(bush)
  })
  ;[
    [6.8, 1.5, 1.2],
    [7.8, 2.2, 0.8],
  ].forEach(([x, z, s]) => {
    const rockery = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), rockeryMaterial)
    rockery.position.set(x, s * 0.5, z)
    group.add(rockery)
  })

  // 屋顶平台:护栏甲板 + 无线电天线组(架在坡屋顶顶端)
  const deckMaterial = standardMaterial(0xb9ab90)
  const railMaterial = standardMaterial(0x6f7a85)
  const antennaMaterial = standardMaterial(0x8a939e)
  highlightables.push(deckMaterial, railMaterial, antennaMaterial)
  const deck = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.3, 4), deckMaterial)
  deck.position.set(0.8, 12.72, -0.4)
  group.add(deck)
  // 护栏:四角立柱 + 四面扶手
  const railH = 0.7
  ;[
    [-1.5, -2.4],
    [-1.5, 1.6],
    [3.1, -2.4],
    [3.1, 1.6],
  ].forEach(([x, z]) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, railH, 0.1), railMaterial)
    post.position.set(x, 12.87 + railH / 2, z)
    group.add(post)
  })
  ;[
    [4.6, 0.08, 0.08, 0.8, 12.87 + railH, -2.4],
    [4.6, 0.08, 0.08, 0.8, 12.87 + railH, 1.6],
    [0.08, 0.08, 4, -1.5, 12.87 + railH, -0.4],
    [0.08, 0.08, 4, 3.1, 12.87 + railH, -0.4],
  ].forEach(([w, h, d, x, y, z]) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), railMaterial)
    rail.position.set(x, y, z)
    group.add(rail)
  })
  // 鞭状天线(带红色顶端)
  const whip = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 5, 6), antennaMaterial)
  whip.position.set(-0.7, 12.87 + 2.5, -1.6)
  group.add(whip)
  const whipTip = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 5), lanternMaterial)
  whipTip.position.set(-0.7, 12.87 + 5.05, -1.6)
  group.add(whipTip)
  // 八木天线(立杆 + 横担 + 五根振子)
  const yagiPole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 2.4, 6), antennaMaterial)
  yagiPole.position.set(2.2, 12.87 + 1.2, 0.6)
  group.add(yagiPole)
  const boom = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 3.4), antennaMaterial)
  boom.position.set(2.2, 15.27, 0.6)
  group.add(boom)
  for (let i = 0; i < 5; i++) {
    const element = new THREE.Mesh(
      new THREE.BoxGeometry(1.15 - i * 0.12, 0.05, 0.05),
      antennaMaterial
    )
    element.position.set(2.2, 15.27, 0.6 - 1.4 + i * 0.7)
    group.add(element)
  }
  // 斜拉偶极杆
  const dipole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 3.2, 6), antennaMaterial)
  dipole.position.set(-0.2, 12.87 + 1.6, 1.0)
  dipole.rotation.z = 0.18
  group.add(dipole)

  // 窗户(InstancedMesh),颜色按在线率;外加白色窗框
  const windowGeometry = new THREE.BoxGeometry(1.1, 1.3, 0.16)
  const windowMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
  const frameGeometry = new THREE.BoxGeometry(1.34, 1.56, 0.1)
  const frameMaterial = standardMaterial(0xfaf5ea)
  highlightables.push(frameMaterial)
  const windowSpots = [
    [-4.4, 3.4, 5.34],
    [-1.6, 3.4, 5.34],
    [2.6, 3.4, 5.34],
    [4.8, 3.4, 5.34],
    [-6.34, 3.4, -2.5, Math.PI / 2],
    [-6.34, 3.4, 2.5, Math.PI / 2],
    [-1.8, 7.3, 3.96],
    [1.2, 7.3, 3.96],
    [3.8, 7.3, 3.96],
  ]
  const frames = new THREE.InstancedMesh(frameGeometry, frameMaterial, windowSpots.length)
  const windows = new THREE.InstancedMesh(windowGeometry, windowMaterial, windowSpots.length)
  const dummy = new THREE.Object3D()
  const windowColor = windowColorByRatio(ratio)
  const dimColor = new THREE.Color(windowColor).multiplyScalar(0.55)
  windowSpots.forEach((spot, index) => {
    const rotY = spot[3] || 0
    dummy.position.set(spot[0], spot[1], spot[2])
    dummy.rotation.set(0, rotY, 0)
    dummy.updateMatrix()
    windows.setMatrixAt(index, dummy.matrix)
    windows.setColorAt(index, index % 3 === 2 ? dimColor : windowColor)
    // 窗框略靠后,避免与窗玻璃重叠
    dummy.position.set(spot[0] - Math.sin(rotY) * 0.05, spot[1], spot[2] - Math.cos(rotY) * 0.05)
    dummy.updateMatrix()
    frames.setMatrixAt(index, dummy.matrix)
  })
  windows.instanceMatrix.needsUpdate = true
  frames.instanceMatrix.needsUpdate = true
  if (windows.instanceColor) windows.instanceColor.needsUpdate = true
  group.add(frames)
  group.add(windows)
  highlightables.push(windowMaterial)

  // 二层阳台:挑板 + 护栏 + 法式门
  const balconyMaterial = standardMaterial(0xd8d0bd)
  highlightables.push(balconyMaterial)
  const balcony = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.22, 1.7), balconyMaterial)
  balcony.position.set(0.8, 5.5, 4.5)
  group.add(balcony)
  const frenchDoor = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.3, 0.16), doorMaterial)
  frenchDoor.position.set(0.8, 6.75, 3.9)
  group.add(frenchDoor)
  ;[-1.9, -0.95, 0, 0.95, 1.9].forEach((dx) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.8, 0.09), porchMaterial)
    post.position.set(0.8 + dx, 5.95, 5.25)
    group.add(post)
  })
  const balconyRail = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.08, 0.08), porchMaterial)
  balconyRail.position.set(0.8, 6.37, 5.25)
  group.add(balconyRail)
  ;[-2.0, 3.6].forEach((x) => {
    const sideRail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.6), porchMaterial)
    sideRail.position.set(x, 6.37, 4.5)
    group.add(sideRail)
  })

  // 门口名牌
  const nameplate = makeLabelSprite(
    [
      {
        text: `${platform.isCurrent ? '★当前·' : ''}${platform.isDmr ? '◆ ' : ''}${platform.name}`,
        color: platform.isCurrent ? '#ffd166' : platform.isDmr ? '#36f0cb' : '#8ff9de',
      },
      { text: `在线 ${platform.online}/${platform.total}`, size: 22, bold: false },
    ],
    { scale: 0.055 }
  )
  nameplate.position.set(0, 13.8, 6.2)
  group.add(nameplate)

  // 当前服务器别墅:金色地面光环 + 直冲天际的光柱,山谷里一眼可辨
  if (platform.isCurrent) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(13.5, 0.18, 8, 64),
      new THREE.MeshStandardMaterial({
        color: 0xffd166,
        emissive: 0xffb84d,
        emissiveIntensity: 1.4,
        transparent: true,
        opacity: 0.9,
      })
    )
    ring.rotation.x = Math.PI / 2
    ring.position.y = 0.3
    group.add(ring)
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(2.4, 2.4, 30, 24, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0xffd166,
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    )
    pillar.position.y = 15
    group.add(pillar)
  }

  group.userData = {
    kind: 'villa',
    platform,
    highlightables,
  }
  return group
}

// 群组类型 → 大厅里的建筑造型(颜色由 groupTypeStyles 给,造型由这里给)
const TYPE_SHAPES = {
  0: 'dome', // 公共房间:穹顶亭
  1: 'tower', // 中继互联:中继塔
  2: 'cube', // 设备互联:立方体框架
  4: 'rings', // 数模互联:相扣双环
  5: 'pyramid', // 俱乐部:尖顶帐篷
  6: 'arch', // 车友会:拱门
  7: 'table', // 会议组:圆桌会议台
  100: 'poly', // 其他:多面体
}

// 固定私人房间:id 1/2/3(平台约定),或类型为私人房间
function isPrivateRoomGroup(group) {
  return group.id === 1 || group.id === 2 || group.id === 3 || group.type === 8
}

function structureMaterial(style, extra = {}) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(style.color),
    emissive: new THREE.Color(style.emissive || style.color),
    emissiveIntensity: 0.7,
    transparent: true,
    opacity: 0.92,
    roughness: 0.4,
    ...extra,
  })
}

// 公共房间的建筑造型(带圆形展台)
function buildRoomStructure(group, style) {
  const structure = new THREE.Group()
  const mat = structureMaterial(style)
  const shape = TYPE_SHAPES[group.type] || 'poly'

  // 圆形展台
  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(3.4, 3.7, 0.3, 28),
    structureMaterial(
      { color: '#16233a', emissive: style.emissive || style.color },
      { emissiveIntensity: 0.35, opacity: 0.95 }
    )
  )
  pad.position.y = 0.15
  structure.add(pad)

  switch (shape) {
    case 'dome': {
      const base = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 1.2, 20), mat)
      base.position.y = 0.9
      structure.add(base)
      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(2.2, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        mat
      )
      dome.position.y = 1.5
      structure.add(dome)
      break
    }
    case 'tower': {
      for (const [dx, dz] of [
        [-1.1, -1.1],
        [1.1, -1.1],
        [-1.1, 1.1],
        [1.1, 1.1],
      ]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, 5.2, 6), mat)
        leg.position.set(dx * 0.6, 2.9, dz * 0.6)
        leg.rotation.z = dx * 0.12
        leg.rotation.x = -dz * 0.12
        structure.add(leg)
      }
      const cross = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.12, 1.9), mat)
      cross.position.y = 3.6
      structure.add(cross)
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 8), mat)
      tip.position.y = 5.7
      structure.add(tip)
      break
    }
    case 'cube': {
      const box = new THREE.BoxGeometry(3, 3, 3)
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(box),
        new THREE.LineBasicMaterial({
          color: new THREE.Color(style.emissive || style.color),
          transparent: true,
          opacity: 0.95,
        })
      )
      edges.position.y = 2.2
      structure.add(edges)
      for (const sx of [-1.5, 1.5]) {
        for (const sy of [0.7, 3.7]) {
          for (const sz of [-1.5, 1.5]) {
            const node = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), mat)
            node.position.set(sx, sy, sz)
            structure.add(node)
          }
        }
      }
      break
    }
    case 'rings': {
      const ringA = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.22, 10, 36), mat)
      ringA.position.y = 2.4
      structure.add(ringA)
      const ringB = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.22, 10, 36), mat)
      ringB.position.y = 2.4
      ringB.rotation.y = Math.PI / 2
      structure.add(ringB)
      break
    }
    case 'pyramid': {
      const pyramid = new THREE.Mesh(new THREE.ConeGeometry(2.6, 3.8, 4), mat)
      pyramid.position.y = 2.2
      pyramid.rotation.y = Math.PI / 4
      structure.add(pyramid)
      break
    }
    case 'arch': {
      const arch = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.32, 10, 28, Math.PI), mat)
      arch.position.y = 0.6
      structure.add(arch)
      for (const dx of [-2.3, 2.3]) {
        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), mat)
        foot.position.set(dx, 0.65, 0)
        structure.add(foot)
      }
      break
    }
    case 'table': {
      const table = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 0.45, 24), mat)
      table.position.y = 1.1
      structure.add(table)
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2
        const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.6, 10), mat)
        seat.position.set(Math.cos(angle) * 2.7, 0.6, Math.sin(angle) * 2.7)
        structure.add(seat)
      }
      break
    }
    case 'poly':
    default: {
      const poly = new THREE.Mesh(new THREE.IcosahedronGeometry(2.0, 0), mat)
      poly.position.y = 2.5
      structure.add(poly)
      break
    }
  }
  return structure
}

// 私人房间包厢(小房子 + 门 + 红灯笼)
function buildPrivateBooth(group, style) {
  const booth = new THREE.Group()
  const mat = structureMaterial(style)
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.0, 2.6), mat)
  body.position.y = 1.8
  booth.add(body)
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.6, 1.2, 4), mat)
  roof.position.y = 3.9
  roof.rotation.y = Math.PI / 4
  booth.add(roof)
  const doorMat = structureMaterial(
    { color: '#3a2f28', emissive: style.emissive || style.color },
    { emissiveIntensity: 0.4 }
  )
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.0, 0.16), doorMat)
  door.position.set(0, 1.3, 1.34)
  booth.add(door)
  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(2.6, 2.9, 0.3, 24),
    structureMaterial(
      { color: '#16233a', emissive: style.emissive || style.color },
      { emissiveIntensity: 0.35, opacity: 0.95 }
    )
  )
  pad.position.y = 0.15
  booth.add(pad)
  return booth
}

// 别墅室内:超空间大厅 —— 固定穹顶,房间按球形分布在内壁(四周与上部穹顶),专门的入口
export function buildInterior(groups) {
  const root = new THREE.Group()
  root.name = 'interior'
  const styles = (UNIVERSE_CONFIG && UNIVERSE_CONFIG.groupTypeStyles) || {}
  const list = Array.isArray(groups) ? groups : []

  const publicGroups = list.filter((g) => !isPrivateRoomGroup(g))
  const hallGroup = publicGroups.find((g) => g.id === 0)
  const ringGroups = publicGroups.filter((g) => g.id !== 0)
  const privateGroups = [1, 2, 3].map((id) => list.find((g) => g.id === id)).filter(Boolean)

  // 固定穹顶尺寸:房间多少,穹顶造型不变,只是上面分布的房间数量不同
  const DOME_RADIUS = 60

  // ---- 超空间外壳:巨大穹顶(内壁夜空) ----
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(DOME_RADIUS, 32, 24),
    new THREE.MeshBasicMaterial({ color: 0x050b18, side: THREE.BackSide })
  )
  dome.position.y = 6
  root.add(dome)

  // 星点
  const starCount = 400
  const starPositions = new Float32Array(starCount * 3)
  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(1 - Math.random() * 0.85)
    const r = DOME_RADIUS - 4 + Math.random() * 3
    starPositions[i * 3] = Math.sin(phi) * Math.cos(theta) * r
    starPositions[i * 3 + 1] = Math.cos(phi) * r + 6
    starPositions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r
  }
  const starGeometry = new THREE.BufferGeometry()
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
  const stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({
      color: 0x9fd8ff,
      size: 0.35,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  )
  root.add(stars)

  // 发光地板 + 网格
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(DOME_RADIUS - 2, 64),
    new THREE.MeshStandardMaterial({ color: 0x0a1526, roughness: 0.85, metalness: 0.2 })
  )
  floor.rotation.x = -Math.PI / 2
  root.add(floor)
  const grid = new THREE.GridHelper((DOME_RADIUS - 2) * 2, 46, 0x36f0cb, 0x12324a)
  grid.position.y = 0.05
  grid.material.transparent = true
  grid.material.opacity = 0.3
  root.add(grid)

  // ---- 中央大厅(群组 id=0) ----
  const hallStyle = (hallGroup && styles[hallGroup.type]) || styles[0] || ROOM_STYLE_FALLBACK
  const dais = new THREE.Mesh(
    new THREE.CylinderGeometry(6.5, 7.2, 0.5, 36),
    structureMaterial(hallStyle, { emissiveIntensity: 0.5 })
  )
  dais.position.y = 0.25
  if (hallGroup) {
    dais.userData = {
      kind: 'room',
      group: hallGroup,
      deviceRadius: 4.5,
      camOffset: new THREE.Vector3(0, 5.5, 11),
    }
  }
  root.add(dais)
  const daisRim = new THREE.Mesh(
    new THREE.TorusGeometry(7.0, 0.14, 8, 64),
    structureMaterial(hallStyle, { emissiveIntensity: 1.2 })
  )
  daisRim.rotation.x = Math.PI / 2
  daisRim.position.y = 0.52
  daisRim.userData = { kind: 'decor' }
  root.add(daisRim)
  const hallLabel = makeLabelSprite(
    [
      { text: (hallGroup && hallGroup.name) || '大厅', color: '#8ff9de', size: 26 },
      {
        text: hallGroup
          ? `${hallGroup.online_dev_number ?? 0}/${hallGroup.total_dev_number ?? 0} 在线`
          : '',
        size: 20,
        bold: false,
      },
    ],
    { scale: 0.045 }
  )
  hallLabel.position.set(0, 6.2, 0)
  hallLabel.userData = { kind: 'decor' }
  root.add(hallLabel)

  // 大厅内圈:能量柱环,撑起空间感
  const pillarCount = 10
  const pillarMat = structureMaterial(
    { color: '#1b2b47', emissive: '#36f0cb' },
    { emissiveIntensity: 0.6, opacity: 0.95 }
  )
  const pillarCapMat = structureMaterial(
    { color: '#36f0cb', emissive: '#36f0cb' },
    { emissiveIntensity: 1.4 }
  )
  for (let i = 0; i < pillarCount; i++) {
    const a = (i / pillarCount) * Math.PI * 2 + Math.PI / pillarCount
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 7, 10), pillarMat)
    pillar.position.set(Math.cos(a) * 11, 3.5, Math.sin(a) * 11)
    root.add(pillar)
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), pillarCapMat)
    cap.position.set(Math.cos(a) * 11, 7.3, Math.sin(a) * 11)
    root.add(cap)
  }

  // 中央全息屏(环绕大厅,展示氛围)
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2
    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(4.5, 2.6),
      structureMaterial(
        { color: '#0f2038', emissive: '#36f0cb' },
        { emissiveIntensity: 0.5, opacity: 0.7, side: THREE.DoubleSide }
      )
    )
    panel.position.set(Math.cos(a) * 5, 4.6, Math.sin(a) * 5)
    panel.lookAt(0, 4.6, 0)
    root.add(panel)
  }

  // ---- 专门的入口(南侧发光拱门,点击返回上一级) ----
  const entrance = new THREE.Group()
  entrance.userData = { kind: 'entrance' }
  const gateMat = structureMaterial(
    { color: '#12324a', emissive: '#36f0cb' },
    { emissiveIntensity: 0.9 }
  )
  const gateArch = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.35, 10, 32, Math.PI), gateMat)
  gateArch.position.y = 0.8
  entrance.add(gateArch)
  for (const dx of [-4.2, 4.2]) {
    const gatePillar = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 5.2, 10), gateMat)
    gatePillar.position.set(dx, 2.6, 0)
    entrance.add(gatePillar)
  }
  const gateLabel = makeLabelSprite([{ text: '入口', color: '#8ff9de' }], { scale: 0.05 })
  gateLabel.position.set(0, 6.2, 0)
  entrance.add(gateLabel)
  entrance.position.set(0, 0, DOME_RADIUS - 14)
  entrance.lookAt(0, 0, 0)
  root.add(entrance)

  // ---- 公共房间:球形分布在穹顶内壁(四周与上部穹顶) ----
  // 高度角 10°(近地面墙) → 62°(穹顶上部),黄金角螺旋均匀分布,房间少时穹顶造型不变
  const golden = Math.PI * (3 - Math.sqrt(5))
  const inset = 11
  ringGroups.forEach((group, index) => {
    const style = styles[group.type] || ROOM_STYLE_FALLBACK
    const structure = buildRoomStructure(group, style)
    const n = Math.max(ringGroups.length, 1)
    const t = (index + 0.5) / n
    const elev = ((10 + t * 52) * Math.PI) / 180
    const theta = index * golden
    const horiz = Math.cos(elev)
    const dir = new THREE.Vector3(Math.cos(theta) * horiz, Math.sin(elev), Math.sin(theta) * horiz)
    structure.position.copy(dir).multiplyScalar(DOME_RADIUS - inset)
    structure.position.y += 6
    structure.lookAt(0, 6, 0)
    structure.userData = {
      kind: 'room',
      group,
      deviceRadius: 2.4,
      // 相机架在房间与球心之间,看向房间
      camOffset: dir
        .clone()
        .multiplyScalar(-10)
        .add(new THREE.Vector3(0, 2, 0)),
    }
    const label = makeLabelSprite(
      [
        { text: group.name || `房间 ${group.id}`, color: '#8ff9de', size: 24 },
        {
          text: `${style.label || ''} · ${group.online_dev_number ?? 0}/${group.total_dev_number ?? 0}`,
          size: 20,
          bold: false,
        },
      ],
      { scale: 0.04 }
    )
    label.position.set(0, 7.2, 0)
    structure.add(label)

    // 房间围合:U 形矮墙 + 墙顶发光压线(开口朝向球心),贴合穹顶内壁
    const alcoveMat = structureMaterial(
      { color: '#1b2b47', emissive: style.emissive || style.color },
      { emissiveIntensity: 0.5, opacity: 0.9 }
    )
    const wallH = 3.2
    const back = new THREE.Mesh(new THREE.BoxGeometry(8.6, wallH, 0.28), alcoveMat)
    back.position.set(0, wallH / 2, -4.2)
    structure.add(back)
    for (const sx of [-4.2, 4.2]) {
      const side = new THREE.Mesh(new THREE.BoxGeometry(0.28, wallH, 8.6), alcoveMat)
      side.position.set(sx, wallH / 2, 0)
      structure.add(side)
    }
    const trim = new THREE.Mesh(
      new THREE.BoxGeometry(8.6, 0.12, 0.34),
      structureMaterial(style, { emissiveIntensity: 1.2 })
    )
    trim.position.set(0, wallH + 0.06, -4.2)
    structure.add(trim)
    root.add(structure)

    // 发光步道:只给低层房间(靠近地面)铺设
    if (elev < (22 * Math.PI) / 180) {
      const walkway = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.06, Math.max(DOME_RADIUS - inset - 12, 4)),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(style.emissive || style.color),
          transparent: true,
          opacity: 0.35,
        })
      )
      const groundAngle = Math.atan2(dir.z, dir.x)
      const midR = (7.5 + DOME_RADIUS - inset) / 2
      walkway.position.set(Math.cos(groundAngle) * midR, 0.08, Math.sin(groundAngle) * midR)
      walkway.rotation.y = Math.PI / 2 - groundAngle
      root.add(walkway)
    }
  })

  // ---- 3 间固定私人房间(北侧包厢,与入口相对) ----
  const privateStyle = styles[8] || ROOM_STYLE_FALLBACK
  privateGroups.forEach((group, index) => {
    const booth = buildPrivateBooth(group, privateStyle)
    booth.position.set((index - 1) * 11, 0, -(DOME_RADIUS - 16))
    booth.lookAt(0, 0, 0)
    booth.userData = {
      kind: 'room',
      group,
      deviceRadius: 1.6,
      camOffset: new THREE.Vector3(0, 3.2, 6),
    }
    // 包厢矮院栏(中间留门)
    const fenceMat = structureMaterial(
      { color: '#2b1a24', emissive: privateStyle.emissive || privateStyle.color },
      { emissiveIntensity: 0.5, opacity: 0.9 }
    )
    for (const sx of [-2.2, 2.2]) {
      const fence = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.8, 0.18), fenceMat)
      fence.position.set(sx, 0.55, 2.8)
      booth.add(fence)
    }
    const label = makeLabelSprite(
      [
        { text: group.name || `私人房间 ${group.id}`, color: '#ffb3c2', size: 24 },
        {
          text: `私人 · ${group.online_dev_number ?? 0}/${group.total_dev_number ?? 0}`,
          size: 20,
          bold: false,
        },
      ],
      { scale: 0.035 }
    )
    label.position.set(0, 5.4, 0)
    booth.add(label)
    root.add(booth)
  })

  // 记录超空间尺寸,供相机范围控制使用
  root.userData.hyperspaceRadius = DOME_RADIUS
  return root
}

function addWhipAntenna(parent, x, y, z, height, color = 0x222831) {
  const antenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.07, height, 5),
    new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.4 })
  )
  antenna.position.set(x, y + height / 2, z)
  parent.add(antenna)
  const tip = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 6, 5),
    new THREE.MeshStandardMaterial({ color: 0xff5555, emissive: 0xff2222, emissiveIntensity: 0.8 })
  )
  tip.position.set(x, y + height + 0.08, z)
  parent.add(tip)
  return antenna
}

function addOledScreen(parent, width, height, position, accent) {
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(accent) })
  )
  screen.position.copy(position)
  parent.add(screen)
  return screen
}

function addStatusLed(parent, y, device) {
  const online = !!(device && device.is_online)
  const led = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 8, 6),
    new THREE.MeshStandardMaterial({
      color: online ? 0x2bd47e : 0x6b7280,
      emissive: online ? 0x2bd47e : 0x4b5563,
      emissiveIntensity: online ? 1.4 : 0.2,
    })
  )
  led.position.set(0, y, 0)
  parent.add(led)
  return led
}

// 设备墙龛位:一个盒子一台设备,呼号-SSID 直接印在盒子正面(万佛宫式)
export function buildDeviceNiche(device) {
  const group = new THREE.Group()
  group.name = `niche-${device.id}`
  const online = !!device.is_online
  const frameColor = online ? 0x2bd47e : 0x4b5563

  // 发光状态外框(在线绿 / 离线灰)
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(1.9, 1.35, 0.42),
    new THREE.MeshStandardMaterial({
      color: frameColor,
      emissive: frameColor,
      emissiveIntensity: online ? 0.9 : 0.2,
      transparent: true,
      opacity: 0.9,
      roughness: 0.5,
    })
  )
  group.add(frame)

  // 盒子本体
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 1.15, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x1a2436, roughness: 0.6, metalness: 0.3 })
  )
  box.position.z = 0.08
  group.add(box)

  // 正面铭牌(印在盒面上,不是悬浮 Sprite)
  const { texture, width, height } = makeTextTexture(
    [
      {
        text: `${device.callsign}-${device.ssid}`,
        size: 30,
        color: online ? '#8ff9de' : '#9aa4b2',
      },
      { text: device.name || (device.dmrid ? `DMR ${device.dmrid}` : ''), size: 22, bold: false },
    ],
    { background: 'rgba(8, 20, 38, 0)', borderColor: 'rgba(0, 0, 0, 0)' }
  )
  const plate = new THREE.Mesh(
    new THREE.PlaneGeometry(1.55, 1.55 * (height / width)),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true })
  )
  plate.position.z = 0.34
  group.add(plate)

  group.userData = {
    kind: 'device',
    device,
    led: frame,
    ledPhase: Math.random() * Math.PI * 2,
  }
  return group
}

// 按 dev_model 预设生成拟真设备小模型
export function buildDeviceMesh(device) {
  const fallback = { kind: 'box', shape: 'box', color: '#7f8ea3', accent: '#36f0cb', antenna: true }
  let preset = fallback
  try {
    preset = deviceMeshPreset(device.dev_model) || fallback
  } catch {
    preset = fallback
  }
  const bodyColor = new THREE.Color(preset.color || fallback.color)
  const accentColor = new THREE.Color(preset.accent || fallback.accent)

  const group = new THREE.Group()
  group.name = `device-${device.id}`
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: bodyColor,
    roughness: 0.55,
    metalness: 0.35,
  })
  const darkMaterial = new THREE.MeshStandardMaterial({
    color: 0x1c2531,
    roughness: 0.5,
    metalness: 0.3,
  })
  const accentMaterial = new THREE.MeshStandardMaterial({
    color: accentColor,
    emissive: accentColor,
    emissiveIntensity: 0.9,
  })

  let ledY = 2
  switch (preset.shape) {
    case 'handheld': {
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.2, 0.6), bodyMaterial)
      body.position.y = 1.1
      group.add(body)
      addOledScreen(group, 0.55, 0.5, new THREE.Vector3(0, 1.6, 0.31), preset.accent)
      const ptt = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.5, 0.3), darkMaterial)
      ptt.position.set(0.52, 1.2, 0)
      group.add(ptt)
      addWhipAntenna(group, 0.22, 2.2, 0, 1.4)
      ledY = 2.35
      break
    }
    case 'rack': {
      const rack = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.2, 2), bodyMaterial)
      rack.position.y = 1.6
      group.add(rack)
      for (let row = 0; row < 3; row++) {
        const panel = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.68, 0.1), darkMaterial)
        panel.position.set(0, 0.75 + row * 0.95, 1.02)
        group.add(panel)
        for (let dot = 0; dot < 4; dot++) {
          const light = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.06), accentMaterial)
          light.position.set(-0.8 + dot * 0.5, 0.75 + row * 0.95, 1.1)
          group.add(light)
        }
      }
      ledY = 3.45
      break
    }
    case 'phone': {
      const phone = new THREE.Mesh(new THREE.BoxGeometry(1.15, 2.35, 0.14), darkMaterial)
      phone.position.y = 2.2
      group.add(phone)
      addOledScreen(group, 0.95, 2.05, new THREE.Vector3(0, 2.2, 0.09), preset.accent)
      // 全息光环
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.35, 0.05, 8, 40),
        new THREE.MeshStandardMaterial({
          color: accentColor,
          emissive: accentColor,
          emissiveIntensity: 1.2,
          transparent: true,
          opacity: 0.75,
        })
      )
      ring.rotation.x = Math.PI / 2
      ring.position.y = 0.6
      group.add(ring)
      ledY = 3.55
      break
    }
    case 'hotspot': {
      const box = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.55, 1.4), bodyMaterial)
      box.position.y = 0.28
      group.add(box)
      addOledScreen(group, 0.6, 0.3, new THREE.Vector3(0, 0.42, 0.71), preset.accent)
      addWhipAntenna(group, 0.45, 0.55, -0.45, 0.9)
      ledY = 0.85
      break
    }
    case 'tower': {
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.5, 3.4, 4), bodyMaterial)
      mast.position.y = 1.7
      group.add(mast)
      const cross = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.08), darkMaterial)
      cross.position.y = 2.9
      group.add(cross)
      const top = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), accentMaterial)
      top.position.y = 3.5
      group.add(top)
      ledY = 3.8
      break
    }
    case 'box':
    default: {
      // NRL 盒子:机身 + OLED 屏 + 旋钮 + 鞭状天线
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.3, 1.8), bodyMaterial)
      body.position.y = 0.65
      group.add(body)
      const panel = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.05, 0.08), darkMaterial)
      panel.position.set(0, 0.65, 0.92)
      group.add(panel)
      addOledScreen(group, 0.85, 0.5, new THREE.Vector3(-0.5, 0.72, 0.97), preset.accent)
      for (let i = 0; i < 2; i++) {
        const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.14, 10), darkMaterial)
        knob.rotation.x = Math.PI / 2
        knob.position.set(0.45 + i * 0.5, 0.55, 0.98)
        group.add(knob)
      }
      if (preset.antenna !== false) {
        addWhipAntenna(group, 0.85, 1.3, -0.5, 2.1)
      }
      ledY = 1.55
      break
    }
  }

  // 状态灯:在线绿灯呼吸,离线灰
  const led = addStatusLed(group, ledY, device)

  // 名牌:呼号-SSID(默认隐藏,悬停设备时才显示,避免一堆名牌挤在一起)
  const label = makeLabelSprite(
    [
      { text: `${device.callsign}-${device.ssid}`, size: 26 },
      { text: device.name || (device.dmrid ? `DMR ${device.dmrid}` : ''), size: 20, bold: false },
    ],
    { scale: 0.016 }
  )
  label.position.set(0, ledY + 1.4, 0)
  label.visible = false
  group.add(label)

  group.userData = {
    kind: 'device',
    device,
    led,
    label,
    ledPhase: Math.random() * Math.PI * 2,
  }
  return group
}
