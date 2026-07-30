import * as THREE from 'three'
import { isDmrPlatform } from '@/config/universe'
import { Terrain, terrainHeight } from './world/Terrain'
import { buildVilla, buildInterior, buildDeviceNiche } from './world/Villa'
import { makeLabelSprite } from './core/label'
import { FiberNetwork } from './world/FiberNetwork'
import { AntennaTower } from './world/AntennaTower'
import { removeAndDispose } from './core/dispose'

const MODE = {
  OVERVIEW: 'OVERVIEW',
  VILLA: 'VILLA',
  INTERIOR: 'INTERIOR',
  ROOM: 'ROOM'
}

const OVERVIEW_POSITION = new THREE.Vector3(0, 180, 140)
const OVERVIEW_TARGET = new THREE.Vector3(0, 0, 0)
// 超空间(别墅内部)的独立坐标:远离山谷,与现实场景完全隔离
const HYPERSPACE_CENTER = new THREE.Vector3(0, 0, 2000)
// 房间内设备墙分页大小:200 台以内不分页,超出才翻页
const DEVICES_PER_PAGE = 200

function easeInOutCubic(k) {
  return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2
}

function onlineRatio(platform) {
  const total = Number(platform && platform.total) || 0
  const online = Number(platform && platform.online) || 0
  return total > 0 ? online / total : 0
}

export default class UniverseApp {
  constructor(container) {
    if (!container) {
      throw new Error('[UniverseApp] container element is required')
    }
    this.container = container
    this.events = {}
    this.mode = MODE.OVERVIEW
    this.quality = 'high'
    this.platforms = []
    this.groupsList = []
    this.devicesMap = {}
    this.villas = new Map()
    this.focusedVillaId = null
    this.currentRoomId = null
    this.cameraTween = null
    this._disposed = false

    // 上帝视角轨道相机状态（围绕 cameraTarget 的球坐标）
    this.orbit = { radius: 230, theta: 0, phi: 0.66 }
    this._drag = null
    this._suppressClick = false
    this._keys = new Set()
    this._lastInteract = 0

    // 渲染器 / 场景 / 相机
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(this.renderer.domElement)

    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.Fog(0xd8ecf5, 260, 720)

    this.camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      1500
    )
    this.camera.position.copy(OVERVIEW_POSITION)
    this.cameraTarget = OVERVIEW_TARGET.clone()
    this._syncOrbitFromCamera()

    // 灯光(暖阳白昼,未来乡村氛围)
    const hemisphere = new THREE.HemisphereLight(0xcfe8ff, 0x8fae7a, 0.95)
    this.scene.add(hemisphere)
    const sun = new THREE.DirectionalLight(0xfff0dd, 1.6)
    sun.position.set(120, 180, 80)
    this.scene.add(sun)
    const ambient = new THREE.AmbientLight(0x728c9e, 0.5)
    this.scene.add(ambient)

    // 世界组成
    this.timer = new THREE.Timer()
    if (typeof document !== 'undefined') {
      this.timer.connect(document) // 页面隐藏时避免超大时间步
    }
    this.terrain = new Terrain(this.scene, this.quality)
    this.fiberNetwork = new FiberNetwork(this.scene, this.quality)
    this.tower = null
    this.villaRoot = new THREE.Group()
    this.villaRoot.name = 'villas'
    this.scene.add(this.villaRoot)
    this.roomRoot = null
    this.deviceRoot = new THREE.Group()
    this.deviceRoot.name = 'devices'
    this.scene.add(this.deviceRoot)

    // 拾取
    this.raycaster = new THREE.Raycaster()
    this.pointer = new THREE.Vector2()

    // 事件监听
    this._boundPointerMove = event => this._handlePointerMove(event)
    this._boundPointerDown = event => this._handlePointerDown(event)
    this._boundPointerUp = event => this._handlePointerUp(event)
    this._boundWheel = event => this._handleWheel(event)
    this._boundClick = event => this._handleClick(event)
    this._boundContextMenu = event => this._handleContextMenu(event)
    this._boundDblClick = event => this._handleDblClick(event)
    this._boundKeyDown = event => this._handleKeyDown(event)
    this._boundKeyUp = event => this._handleKeyUp(event)
    this._boundResize = () => this._handleResize()
    const canvas = this.renderer.domElement
    canvas.addEventListener('pointermove', this._boundPointerMove)
    canvas.addEventListener('pointerdown', this._boundPointerDown)
    canvas.addEventListener('pointerup', this._boundPointerUp)
    canvas.addEventListener('pointerleave', this._boundPointerUp)
    canvas.addEventListener('wheel', this._boundWheel, { passive: false })
    canvas.addEventListener('click', this._boundClick)
    canvas.addEventListener('contextmenu', this._boundContextMenu)
    canvas.addEventListener('dblclick', this._boundDblClick)
    window.addEventListener('keydown', this._boundKeyDown)
    window.addEventListener('keyup', this._boundKeyUp)
    window.addEventListener('resize', this._boundResize)

    this.renderer.setAnimationLoop(() => this._animate())
  }

  // ---------- 事件总线 ----------
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }

  off(event, callback) {
    const list = this.events[event]
    if (!list) return
    this.events[event] = list.filter(cb => cb !== callback)
  }

  emit(event, payload) {
    const list = this.events[event]
    if (!list) return
    list.forEach(cb => cb(payload))
  }

  // ---------- 数据驱动 ----------
  setPlatforms(platforms = []) {
    this.platforms = Array.isArray(platforms) ? platforms : []
    while (this.villaRoot.children.length) {
      removeAndDispose(this.villaRoot.children[0])
    }
    this.villas.clear()
    this.platforms.forEach((platform, index) => {
      const villa = buildVilla(platform)
      villa.position.copy(this._platformPosition(platform, index, this.platforms.length))
      this.villaRoot.add(villa)
      this.villas.set(platform.id, { platform, group: villa })
    })
    this._rebuildTowerAndFiber()

    // 清除别墅院落周边的树木,避免挡住院门
    if (this.terrain && typeof this.terrain.clearVegetationNear === 'function') {
      const points = this.platforms
        .map(p => p.position)
        .filter(pos => pos && isFinite(pos.x) && isFinite(pos.z))
      this.terrain.clearVegetationNear(points, 17)
    }

    // 刷新后维持或退出聚焦状态
    if (this.mode !== MODE.OVERVIEW) {
      if (this.focusedVillaId != null && this.villas.has(this.focusedVillaId)) {
        this._applyVillaFocusVisuals()
        this._buildRooms()
        if (this.mode === MODE.ROOM) {
          const roomExists = this.roomRoot && this.roomRoot.children.some(child => {
            return child.userData.group && child.userData.group.id === this.currentRoomId
          })
          if (roomExists) {
            this._applyRoomFocusVisuals()
            this._buildDevices()
          } else {
            this.backToOverview()
          }
        }
      } else {
        this.mode = MODE.OVERVIEW
        this.focusedVillaId = null
        this.currentRoomId = null
        this._clearRooms()
        this._clearDevices()
        this._tweenCamera(OVERVIEW_POSITION, OVERVIEW_TARGET, 1.6)
        this.emit('modechange', this.mode)
      }
    }
  }

  setGroups(groups = []) {
    this.groupsList = Array.isArray(groups) ? groups : []
    if (this.mode === MODE.OVERVIEW) return
    this._buildRooms()
    if (this.mode === MODE.ROOM) {
      const roomExists = this.roomRoot && this.roomRoot.children.some(child => {
        return child.userData.group && child.userData.group.id === this.currentRoomId
      })
      if (roomExists) {
        this._applyRoomFocusVisuals()
        this._buildDevices()
      } else {
        this.backToOverview()
      }
    }
  }

  setDevices(groupId, devices = []) {
    this.devicesMap[groupId] = Array.isArray(devices) ? devices : []
    if (this.mode === MODE.ROOM && this.currentRoomId === groupId) {
      this._buildDevices()
    }
  }

  // ---------- 交互动作 ----------
  highlightVilla(id = null) {
    this.villas.forEach((entry, villaId) => {
      const active = id != null && villaId === id
      const materials = entry.group.userData.highlightables || []
      materials.forEach(material => {
        if (!material.emissive) return
        if (active) {
          material.emissive.setHex(0x36f0cb)
          material.emissiveIntensity = 0.45
        } else {
          material.emissive.setHex(material.userData.origEmissive ?? 0x000000)
          material.emissiveIntensity = material.userData.origEmissiveIntensity ?? 1
        }
      })
    })
  }

  focusVilla(id) {
    const entry = this.villas.get(id)
    if (!entry) return
    // 已聚焦当前别墅时再次点击:进入室内
    if ((this.mode === MODE.VILLA || this.mode === MODE.INTERIOR) && this.focusedVillaId === id) {
      this.enterInterior()
      return
    }
    this.mode = MODE.VILLA
    this.focusedVillaId = id
    this.currentRoomId = null
    this._clearDevices()
    this._applyVillaFocusVisuals()
    // 只有当前登录的服务器才能查看房间(群组数据只属于当前服务器)
    if (entry.platform.isCurrent) {
      this._buildRooms()
    } else {
      this._clearRooms()
      this.emit('notice', { message: `${entry.platform.name || '远程服务器'}：只能参观院落，房间仅当前登录服务器可查看` })
    }
    // 直接到达别墅院内门口(门在别墅局部 +z 面 (0, 2.6, 5.4), 见 buildVilla;
    // 落点在院墙内且避开院门门楼(z>=12.1),防止相机被门楼挡住)
    const door = entry.group.position.clone().add(new THREE.Vector3(0, 2.6, 5.4))
    this._tweenCamera(
      door.clone().add(new THREE.Vector3(0, 1.4, 5)),
      door.clone(),
      1.8
    )
    this.emit('modechange', this.mode)
  }

  // 超空间入口视角:从专门的入口拱门进入,略微仰视,看见四周与上部穹顶的房间
  _hyperspaceEntryView() {
    const r = this.hyperspaceRadius || 60
    return {
      position: HYPERSPACE_CENTER.clone().add(new THREE.Vector3(0, 7, r - 16)),
      target: HYPERSPACE_CENTER.clone().add(new THREE.Vector3(0, 12, 0))
    }
  }

  // 进入别墅室内(仅当前服务器别墅可进入)
  enterInterior() {
    const entry = this.villas.get(this.focusedVillaId)
    if (!entry || !entry.platform.isCurrent) {
      if (entry) {
        this.emit('notice', { message: '仅当前登录服务器的别墅可以进入室内' })
      }
      return
    }
    if (!this.roomRoot) {
      this._buildRooms()
    }
    this.mode = MODE.INTERIOR
    this.currentRoomId = null
    this._clearDevices()
    this._applyVillaFocusVisuals()
    this._applyRoomFocusVisuals()
    // 进入超空间大厅:传送到独立空间,俯瞰全场
    const view = this._hyperspaceEntryView()
    this._tweenCamera(view.position, view.target, 1.8)
    this.emit('modechange', this.mode)
  }

  enterRoom(groupId) {
    if (this.mode === MODE.OVERVIEW || !this.roomRoot) return
    const room = this.roomRoot.children.find(child => {
      return child.userData.group && child.userData.group.id === groupId
    })
    if (!room) return
    this.mode = MODE.ROOM
    this.currentRoomId = groupId
    this.devicePage = 0
    this._applyVillaFocusVisuals()
    this._applyRoomFocusVisuals()
    this._buildDevices()
    // 进入该房间/建筑的视角(造型自带相机偏移)
    const center = room.getWorldPosition(new THREE.Vector3())
    const camOffset = room.userData.camOffset || new THREE.Vector3(0, 2.3, 3.0)
    this._tweenCamera(
      center.clone().add(camOffset),
      center.clone().add(new THREE.Vector3(0, 1.2, 0)),
      1.4
    )
    this.emit('modechange', this.mode)
  }

  // 返回上一级:ROOM → INTERIOR → VILLA → OVERVIEW
  backToOverview() {
    if (this.mode === MODE.ROOM) {
      this.mode = MODE.INTERIOR
      this.currentRoomId = null
      this._clearDevices()
      this._applyRoomFocusVisuals()
      const entry = this.villas.get(this.focusedVillaId)
      if (entry) {
        // 回到超空间大厅全景
        const view = this._hyperspaceEntryView()
        this._tweenCamera(view.position, view.target, 1.4)
      }
      this.emit('modechange', this.mode)
    } else if (this.mode === MODE.INTERIOR) {
      this.mode = MODE.VILLA
      this.currentRoomId = null
      this._clearDevices()
      this._applyVillaFocusVisuals()
      this._applyRoomFocusVisuals()
      const entry = this.villas.get(this.focusedVillaId)
      if (entry) {
        // 回到该别墅院内门口(落点避开院门门楼)
        const door = entry.group.position.clone().add(new THREE.Vector3(0, 2.6, 5.4))
        this._tweenCamera(
          door.clone().add(new THREE.Vector3(0, 1.4, 5)),
          door.clone(),
          1.4
        )
      }
      this.emit('modechange', this.mode)
    } else if (this.mode === MODE.VILLA) {
      this.mode = MODE.OVERVIEW
      this.focusedVillaId = null
      this._clearRooms()
      this._applyVillaFocusVisuals()
      this._tweenCamera(OVERVIEW_POSITION, OVERVIEW_TARGET, 1.8)
      this.emit('modechange', this.mode)
    }
  }

  // 全网光纤脉冲 2 秒
  pulseNetwork() {
    this.fiberNetwork.pulse()
  }

  setQuality(quality) {
    if (this.quality === quality) return
    this.quality = quality
    this.renderer.setPixelRatio(quality === 'low' ? 1 : Math.min(window.devicePixelRatio || 1, 2))
    this._handleResize()
    this.terrain.dispose()
    this.terrain = new Terrain(this.scene, quality)
    // 重建地形后重新清除院落周边的树
    const points = this.platforms
      .map(p => p.position)
      .filter(pos => pos && isFinite(pos.x) && isFinite(pos.z))
    this.terrain.clearVegetationNear(points, 17)
    this.fiberNetwork.setQuality(quality)
    this._applyWorldVisibility()
  }

  dispose() {
    if (this._disposed) return
    this._disposed = true
    this.renderer.setAnimationLoop(null)
    if (this.timer) {
      this.timer.disconnect()
    }

    const canvas = this.renderer.domElement
    canvas.removeEventListener('pointermove', this._boundPointerMove)
    canvas.removeEventListener('pointerdown', this._boundPointerDown)
    canvas.removeEventListener('pointerup', this._boundPointerUp)
    canvas.removeEventListener('pointerleave', this._boundPointerUp)
    canvas.removeEventListener('wheel', this._boundWheel)
    canvas.removeEventListener('click', this._boundClick)
    canvas.removeEventListener('contextmenu', this._boundContextMenu)
    canvas.removeEventListener('dblclick', this._boundDblClick)
    window.removeEventListener('keydown', this._boundKeyDown)
    window.removeEventListener('keyup', this._boundKeyUp)
    window.removeEventListener('resize', this._boundResize)

    this.terrain.dispose()
    this.fiberNetwork.dispose()
    if (this.tower) {
      this.tower.dispose()
      this.tower = null
    }
    this._clearRooms()
    this._clearDevices()
    removeAndDispose(this.villaRoot)
    removeAndDispose(this.deviceRoot)
    this.villas.clear()

    this.renderer.dispose()
    if (canvas.parentNode === this.container) {
      this.container.removeChild(canvas)
    }
    this.events = {}
  }

  // ---------- 内部:布局与场景重建 ----------
  _platformPosition(platform, index, total) {
    const pos = platform && platform.position
    if (pos && isFinite(pos.x) && isFinite(pos.z)) {
      return new THREE.Vector3(pos.x, terrainHeight(pos.x, pos.z), pos.z)
    }
    const angle = (index / Math.max(total, 1)) * Math.PI * 2
    const radius = 30 + (index % 3) * 12
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    return new THREE.Vector3(x, terrainHeight(x, z), z)
  }

  _isDmr(platform) {
    if (platform && platform.isDmr === true) return true
    try {
      return typeof isDmrPlatform === 'function' && isDmrPlatform(platform)
    } catch {
      return false
    }
  }

  _rebuildTowerAndFiber() {
    if (this.tower) {
      this.tower.dispose()
      this.tower = null
    }
    const entries = [...this.villas.values()]
    const dmrEntry = entries.find(entry => this._isDmr(entry.platform))

    let towerPos
    if (dmrEntry) {
      towerPos = dmrEntry.group.position.clone().add(new THREE.Vector3(16, 0, -12))
    } else {
      towerPos = new THREE.Vector3(0, 0, -46)
    }
    towerPos.y = terrainHeight(towerPos.x, towerPos.z)
    this.tower = new AntennaTower(this.scene, towerPos)

    if (dmrEntry) {
      const targets = entries
        .filter(entry => entry !== dmrEntry)
        .map(entry => {
          return {
            position: entry.group.position.clone(),
            speed: 0.4 + onlineRatio(entry.platform) * 1.2
          }
        })
      this.fiberNetwork.build(dmrEntry.group.position.clone(), targets)
    } else {
      this.fiberNetwork.build(null)
    }
    this._applyWorldVisibility()
  }

  _applyVillaFocusVisuals() {
    const immersive = this.mode === MODE.INTERIOR || this.mode === MODE.ROOM
    this.villas.forEach((entry, villaId) => {
      const focused = villaId === this.focusedVillaId && this.mode !== MODE.OVERVIEW
      // 进入超空间(INTERIOR/ROOM)后,别墅本身也隐藏——人已"在别墅里面"
      entry.group.visible = immersive ? false : (focused || this.mode === MODE.OVERVIEW)
      // 聚焦不再剖切透明,别墅保持实体(房间已移入超空间,无需剖开)
      const materials = entry.group.userData.highlightables || []
      materials.forEach(material => {
        if (material.userData.cutawaySaved) {
          material.opacity = material.userData.cutawaySaved.opacity
          material.transparent = material.userData.cutawaySaved.transparent
          material.userData.cutawaySaved = null
        }
      })
    })
    this._applyWorldVisibility()
  }

  // 沉浸模式(进入别墅内部/房间)时,隐藏外部世界:地形、水面、光纤、天线塔
  _applyWorldVisibility() {
    const immersive = this.mode === MODE.INTERIOR || this.mode === MODE.ROOM
    if (this.terrain && this.terrain.group) {
      this.terrain.group.visible = !immersive
    }
    if (this.fiberNetwork && this.fiberNetwork.group) {
      this.fiberNetwork.group.visible = !immersive
    }
    if (this.tower && this.tower.group) {
      this.tower.group.visible = !immersive
    }
  }

  _applyRoomFocusVisuals() {
    if (!this.roomRoot) return
    this.roomRoot.children.forEach(child => {
      const kind = child.userData && child.userData.kind
      // 大厅装饰与入口:进入具体房间后隐藏
      if (kind === 'decor' || kind === 'entrance') {
        child.visible = this.mode !== MODE.ROOM
        return
      }
      if (kind !== 'room') return
      const focused = this.mode === MODE.ROOM && child.userData.group && child.userData.group.id === this.currentRoomId
      // 进入房间后,其他房间建筑整体隐藏,不再看到房间外部的东西
      child.visible = this.mode !== MODE.ROOM || focused
      const opacity = this.mode === MODE.ROOM ? (focused ? 0.95 : 0.25) : 0.92
      child.traverse(obj => {
        // 进入房间后隐藏该房间自己的悬浮名牌(页码牌已展示信息,避免重叠)
        if (obj.isSprite) {
          obj.visible = !(this.mode === MODE.ROOM && focused)
          return
        }
        if (obj.material && obj.material.transparent) {
          obj.material.opacity = opacity
          if (obj.material.emissive) {
            obj.material.emissiveIntensity = focused ? 1.1 : 0.7
          }
        }
      })
    })
  }

  _buildRooms() {
    this._clearRooms()
    const entry = this.villas.get(this.focusedVillaId)
    // 仅当前服务器别墅才有房间(群组数据属于当前服务器)
    if (!entry || this.mode === MODE.OVERVIEW || !entry.platform.isCurrent) return
    this.roomRoot = buildInterior(this.groupsList)
    // 超空间放在独立坐标,与山谷场景完全隔离
    this.roomRoot.position.copy(HYPERSPACE_CENTER)
    this.hyperspaceRadius = this.roomRoot.userData.hyperspaceRadius || 48
    this.scene.add(this.roomRoot)
  }

  _clearRooms() {
    if (this.roomRoot) {
      removeAndDispose(this.roomRoot)
      this.roomRoot = null
    }
  }

  _buildDevices() {
    this._clearDevices()
    if (this.mode !== MODE.ROOM || !this.roomRoot) return
    const room = this.roomRoot.children.find(child => {
      return child.userData.group && child.userData.group.id === this.currentRoomId
    })
    if (!room) return
    const devices = [...(this.devicesMap[this.currentRoomId] || [])]
    const center = room.getWorldPosition(new THREE.Vector3())

    // 在线设备优先排序;设备可能几百台,分页上墙
    const sorted = devices.sort((a, b) => {
      const onlineDiff = (b.is_online ? 1 : 0) - (a.is_online ? 1 : 0)
      if (onlineDiff !== 0) return onlineDiff
      return String(a.callsign || '').localeCompare(String(b.callsign || ''))
    })
    const pageCount = Math.max(1, Math.ceil(sorted.length / DEVICES_PER_PAGE))
    this.devicePage = Math.min(this.devicePage || 0, pageCount - 1)
    const pageItems = sorted.slice(
      this.devicePage * DEVICES_PER_PAGE,
      (this.devicePage + 1) * DEVICES_PER_PAGE
    )

    // 设备墙:又高又大的圆柱形龛位墙(万佛宫式),一台设备一个龛盒,呼号印在盒上
    const perLevel = 12
    const levelHeight = 1.75
    const radius = Math.max(5.0, (room.userData.deviceRadius || 0) + 2.2)
    const levels = Math.max(1, Math.ceil(pageItems.length / perLevel))
    const wallHeight = levels * levelHeight + 0.8

    const wall = new THREE.Group()
    wall.name = 'device-wall'
    wall.position.copy(center)
    this.deviceCarousel = wall

    // 圆柱内芯(半透明,让龛位有依托)
    const core = new THREE.Mesh(
      new THREE.CylinderGeometry(radius - 0.4, radius - 0.4, wallHeight, 48, 1, true),
      new THREE.MeshStandardMaterial({
        color: 0x0d1828,
        transparent: true,
        opacity: 0.85,
        roughness: 0.8,
        side: THREE.DoubleSide
      })
    )
    core.position.y = 0.6 + wallHeight / 2 - 0.4
    wall.add(core)

    // 每层圆环腰线
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x1c2f4a,
      emissive: 0x36f0cb,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.7
    })
    for (let l = 0; l <= levels; l++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.05, 6, 64), railMat)
      ring.rotation.x = Math.PI / 2
      ring.position.y = 0.6 + l * levelHeight
      wall.add(ring)
    }

    if (!pageItems.length) {
      const empty = makeLabelSprite([{ text: '暂无设备', color: '#8ff9de' }], { scale: 0.04 })
      empty.position.y = 2
      wall.add(empty)
    }

    pageItems.forEach((device, index) => {
      const level = Math.floor(index / perLevel)
      const col = index % perLevel
      // 每层 12 个龛位,层与层错开,螺旋上升
      const angle = (col / perLevel) * Math.PI * 2 + level * 0.26
      const niche = buildDeviceNiche(device)
      niche.position.set(
        Math.cos(angle) * radius,
        0.6 + level * levelHeight + 0.9,
        Math.sin(angle) * radius
      )
      // 龛盒正面朝外
      niche.rotation.y = Math.PI / 2 - angle
      wall.add(niche)
    })
    this.deviceRoot.add(wall)

    // 房间名称固定在设备塔顶部(不随塔旋转,远离龛盒不重叠)
    const roomName = (room.userData.group && room.userData.group.name) || '房间'
    const topLabel = makeLabelSprite([
      { text: roomName, color: '#8ff9de', size: 28 },
      { text: `共 ${sorted.length} 台设备`, size: 20, bold: false }
    ], { scale: 0.045 })
    topLabel.position.set(center.x, center.y + 0.6 + wallHeight + 1.6, center.z)
    this.deviceRoot.add(topLabel)

    // 页码名牌:放在设备塔侧面,与塔身保持距离,避免重叠
    const pageLabel = makeLabelSprite([
      { text: `第 ${this.devicePage + 1}/${pageCount} 页`, color: '#8ff9de', size: 24 },
      { text: `共 ${sorted.length} 台设备`, size: 20, bold: false }
    ], { scale: 0.045 })
    pageLabel.position.set(center.x + radius + 4.5, center.y + 0.6 + wallHeight * 0.55, center.z)
    this.deviceRoot.add(pageLabel)

    // 3D 翻页箭头(超过一页时显示)
    if (pageCount > 1) {
      const arrowMat = new THREE.MeshStandardMaterial({
        color: 0x36f0cb,
        emissive: 0x36f0cb,
        emissiveIntensity: 1.1,
        transparent: true,
        opacity: 0.95
      })
      const makeArrow = dir => {
        const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.8, 4), arrowMat)
        arrow.position.set(center.x + dir * (radius + 2.6), center.y + 2.6, center.z)
        arrow.rotation.z = dir > 0 ? -Math.PI / 2 : Math.PI / 2
        arrow.userData = { kind: dir > 0 ? 'page-next' : 'page-prev' }
        this.deviceRoot.add(arrow)
      }
      makeArrow(1)
      makeArrow(-1)
    }
  }

  _clearDevices() {
    while (this.deviceRoot.children.length) {
      removeAndDispose(this.deviceRoot.children[0])
    }
    this.deviceCarousel = null
  }

  // ---------- 内部:相机补间 ----------
  _tweenCamera(toPosition, toTarget, duration = 1.6) {
    this.cameraTween = {
      fromPosition: this.camera.position.clone(),
      toPosition: toPosition.clone(),
      fromTarget: this.cameraTarget.clone(),
      toTarget: toTarget.clone(),
      elapsed: 0,
      duration
    }
  }

  _updateTween(dt) {
    if (!this.cameraTween) return
    const tween = this.cameraTween
    tween.elapsed += dt
    const k = easeInOutCubic(Math.min(tween.elapsed / tween.duration, 1))
    this.camera.position.lerpVectors(tween.fromPosition, tween.toPosition, k)
    this.cameraTarget.lerpVectors(tween.fromTarget, tween.toTarget, k)
    if (tween.elapsed >= tween.duration) {
      this.cameraTween = null
      this._syncOrbitFromCamera()
    }
  }

  // ---------- 内部:上帝视角相机控制 ----------
  _syncOrbitFromCamera() {
    const offset = this.camera.position.clone().sub(this.cameraTarget)
    const radius = Math.max(offset.length(), 0.001)
    this.orbit.radius = radius
    this.orbit.theta = Math.atan2(offset.x, offset.z)
    this.orbit.phi = Math.acos(THREE.MathUtils.clamp(offset.y / radius, -1, 1))
  }

  _applyOrbit() {
    const orbit = this.orbit
    orbit.radius = THREE.MathUtils.clamp(orbit.radius, 10, 460)
    // phi 允许越过水平线:可以仰视穹顶顶部的房间
    orbit.phi = THREE.MathUtils.clamp(orbit.phi, 0.08, 2.9)
    // 超空间内:相机活动范围限制在穹顶之内(半径随房间数量缩放)
    if (this.mode === MODE.INTERIOR || this.mode === MODE.ROOM) {
      const limit = this.hyperspaceRadius || 48
      const offset = this.cameraTarget.clone().sub(HYPERSPACE_CENTER)
      if (offset.length() > limit - 8) {
        offset.setLength(limit - 8)
        this.cameraTarget.copy(HYPERSPACE_CENTER).add(offset)
      }
      orbit.radius = Math.min(orbit.radius, limit - 4)
    }
    const sinPhi = Math.sin(orbit.phi)
    this.camera.position.set(
      this.cameraTarget.x + orbit.radius * sinPhi * Math.sin(orbit.theta),
      this.cameraTarget.y + orbit.radius * Math.cos(orbit.phi),
      this.cameraTarget.z + orbit.radius * sinPhi * Math.cos(orbit.theta)
    )
  }

  _markInteract() {
    this._lastInteract = performance.now()
  }

  _isTypingTarget(event) {
    const el = event.target
    if (!el || !el.tagName) return false
    const tag = el.tagName.toUpperCase()
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable === true
  }

  _panBy(dx, dy) {
    // 抓屏式平移目标点（上帝视角浏览山谷）
    const scale = this.orbit.radius * 0.0016
    const forward = new THREE.Vector3(-Math.sin(this.orbit.theta), 0, -Math.cos(this.orbit.theta))
    const right = new THREE.Vector3(Math.cos(this.orbit.theta), 0, -Math.sin(this.orbit.theta))
    this.cameraTarget.addScaledVector(right, -dx * scale)
    this.cameraTarget.addScaledVector(forward, dy * scale)
    this.cameraTarget.y = THREE.MathUtils.clamp(this.cameraTarget.y, 0, 160)
  }

  _handlePointerDown(event) {
    if (this._disposed) return
    this._drag = { button: event.button, x: event.clientX, y: event.clientY, moved: false }
  }

  _handlePointerUp(event) {
    if (this._disposed) return
    const drag = this._drag
    this._drag = null
    if (!drag) return
    if (drag.moved) {
      // 拖拽后的 click 不触发选中
      this._suppressClick = true
      setTimeout(() => { this._suppressClick = false }, 0)
    } else if (drag.button === 2) {
      // 右键单击:返回上一级
      this.backToOverview()
    }
  }

  _handleWheel(event) {
    if (this._disposed) return
    event.preventDefault()
    const factor = 1 + THREE.MathUtils.clamp(event.deltaY, -200, 200) * 0.0012
    this.orbit.radius = THREE.MathUtils.clamp(this.orbit.radius * factor, 10, 460)
    this._markInteract()
  }

  _updateKeyboard(dt) {
    if (!this._keys.size) return
    const boost = this._keys.has('ShiftLeft') || this._keys.has('ShiftRight') ? 3 : 1
    const move = this.orbit.radius * 0.9 * dt * boost
    const forward = new THREE.Vector3(-Math.sin(this.orbit.theta), 0, -Math.cos(this.orbit.theta))
    const right = new THREE.Vector3(Math.cos(this.orbit.theta), 0, -Math.sin(this.orbit.theta))
    let used = false
    if (this._keys.has('KeyW') || this._keys.has('ArrowUp')) {
      this.cameraTarget.addScaledVector(forward, move)
      used = true
    }
    if (this._keys.has('KeyS') || this._keys.has('ArrowDown')) {
      this.cameraTarget.addScaledVector(forward, -move)
      used = true
    }
    if (this._keys.has('KeyA') || this._keys.has('ArrowLeft')) {
      this.cameraTarget.addScaledVector(right, -move)
      used = true
    }
    if (this._keys.has('KeyD') || this._keys.has('ArrowRight')) {
      this.cameraTarget.addScaledVector(right, move)
      used = true
    }
    if (this._keys.has('KeyQ') || this._keys.has('PageDown')) {
      this.cameraTarget.y -= move * 0.6
      used = true
    }
    if (this._keys.has('KeyE') || this._keys.has('PageUp')) {
      this.cameraTarget.y += move * 0.6
      used = true
    }
    if (this._keys.has('KeyZ')) {
      this.orbit.radius = THREE.MathUtils.clamp(this.orbit.radius * (1 - dt * 1.2), 10, 460)
      used = true
    }
    if (this._keys.has('KeyX')) {
      this.orbit.radius = THREE.MathUtils.clamp(this.orbit.radius * (1 + dt * 1.2), 10, 460)
      used = true
    }
    this.cameraTarget.y = THREE.MathUtils.clamp(this.cameraTarget.y, 0, 160)
    if (used) this._markInteract()
  }

  // ---------- 内部:拾取 ----------
  _pick(event) {
    const rect = this.renderer.domElement.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return null
    this.pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    )
    this.raycaster.setFromCamera(this.pointer, this.camera)
    const roots = [this.deviceRoot, this.roomRoot, this.villaRoot].filter(Boolean)
    const hits = this.raycaster.intersectObjects(roots, true)
    for (const hit of hits) {
      let obj = hit.object
      let visible = true
      while (obj) {
        if (obj.visible === false) {
          visible = false
          break
        }
        obj = obj.parent
      }
      if (!visible) continue
      obj = hit.object
      let found = null
      while (obj) {
        if (obj.userData && obj.userData.kind) {
          const kind = obj.userData.kind
          if (kind === 'decor') break // 装饰物不响应点击,穿透到后方对象
          const data = kind === 'villa' ? obj.userData.platform : kind === 'room' ? obj.userData.group : obj.userData.device
          found = { kind, data, object: obj }
          break
        }
        obj = obj.parent
      }
      if (found) return found
    }
    return null
  }

  _handlePointerMove(event) {
    if (this._disposed) return
    if (this._drag) {
      const dx = event.clientX - this._drag.x
      const dy = event.clientY - this._drag.y
      if (Math.abs(dx) + Math.abs(dy) > 3) {
        this._drag.moved = true
      }
      if (this._drag.moved) {
        if (this._drag.button === 0) {
          // 左键拖拽:环绕旋转(可仰视穹顶)
          this.orbit.theta -= dx * 0.005
          this.orbit.phi = THREE.MathUtils.clamp(this.orbit.phi - dy * 0.005, 0.08, 2.9)
        } else {
          // 右/中键拖拽:平移视角
          this._panBy(dx, dy)
        }
        this._drag.x = event.clientX
        this._drag.y = event.clientY
        this._markInteract()
      }
      this.renderer.domElement.style.cursor = this._drag.moved ? 'grabbing' : ''
      return
    }
    const picked = this._pick(event)
    this._hoveringDevice = !!(picked && ['device', 'page-prev', 'page-next'].includes(picked.kind))
    // 设备名牌只在悬停时显示,避免一堆名牌挤在一起
    const hoverMesh = picked && picked.kind === 'device' ? picked.object : null
    if (this._labelMesh !== hoverMesh) {
      if (this._labelMesh && this._labelMesh.userData.label) {
        this._labelMesh.userData.label.visible = false
      }
      this._labelMesh = hoverMesh
      if (this._labelMesh && this._labelMesh.userData.label) {
        this._labelMesh.userData.label.visible = true
      }
    }
    this.renderer.domElement.style.cursor = picked ? 'pointer' : ''
    this.emit('hover', picked ? { ...picked, screen: { x: event.clientX, y: event.clientY }} : null)
  }

  // 设备展架翻页
  _changeDevicePage(delta) {
    const total = (this.devicesMap[this.currentRoomId] || []).length
    const pageCount = Math.max(1, Math.ceil(total / DEVICES_PER_PAGE))
    this.devicePage = (((this.devicePage || 0) + delta) % pageCount + pageCount) % pageCount
    this._buildDevices()
  }

  _handleClick(event) {
    if (this._disposed || event.button !== 0) return
    if (this._suppressClick) {
      this._suppressClick = false
      return
    }
    const picked = this._pick(event)
    if (picked && picked.kind === 'entrance') {
      // 点击入口拱门:返回上一级(房间→大厅→院门)
      this.backToOverview()
      return
    }
    if (picked && (picked.kind === 'page-prev' || picked.kind === 'page-next')) {
      this._changeDevicePage(picked.kind === 'page-next' ? 1 : -1)
      return
    }
    if (picked) {
      this.emit('select', { ...picked, screen: { x: event.clientX, y: event.clientY }})
    }
  }

  _handleContextMenu(event) {
    if (this._disposed) return
    // 仅屏蔽系统菜单;“返回上一级”由右键单击(pointerup 未拖拽)处理
    event.preventDefault()
  }

  _handleDblClick(event) {
    if (this._disposed) return
    if (!this._pick(event)) {
      this.backToOverview()
    }
  }

  _handleKeyDown(event) {
    if (this._disposed) return
    if (event.key === 'Escape') {
      this.backToOverview()
      return
    }
    if (this._isTypingTarget(event)) return
    const handled = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'KeyZ', 'KeyX',
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown']
    if (handled.includes(event.code)) {
      event.preventDefault()
      this._keys.add(event.code)
    }
    if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
      this._keys.add(event.code)
    }
  }

  _handleKeyUp(event) {
    if (this._disposed) return
    this._keys.delete(event.code)
  }

  _handleResize() {
    const width = this.container.clientWidth
    const height = this.container.clientHeight
    if (width === 0 || height === 0) return
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  // ---------- 内部:渲染循环 ----------
  _animate() {
    this.timer.update()
    const dt = Math.min(this.timer.getDelta(), 0.1)
    const t = this.timer.getElapsed()

    this._updateTween(dt)
    this.terrain.update(dt)
    this.fiberNetwork.update(dt)
    if (this.tower) {
      this.tower.update(dt)
    }

    // 设备状态灯呼吸(设备在展架组内,遍历查找)
    this.deviceRoot.traverse(obj => {
      const led = obj.userData && obj.userData.led
      if (!led) return
      const online = !!(obj.userData.device && obj.userData.device.is_online)
      led.material.emissiveIntensity = online ? 1.1 + Math.sin(t * 3 + obj.userData.ledPhase) * 0.7 : 0.15
    })

    // 设备展架缓慢旋转,悬停设备/翻页箭头时暂停
    if (this.deviceCarousel && this.mode === MODE.ROOM && !this._hoveringDevice) {
      this.deviceCarousel.rotation.y += dt * 0.25
    }

    if (!this.cameraTween) {
      this._updateKeyboard(dt)
      // 总览模式且闲置 6 秒后缓慢环绕
      if (this.mode === MODE.OVERVIEW && performance.now() - this._lastInteract > 6000) {
        this.orbit.theta += dt * 0.03
      }
      this._applyOrbit()
    }

    this.camera.lookAt(this.cameraTarget)
    this.renderer.render(this.scene, this.camera)
  }
}
