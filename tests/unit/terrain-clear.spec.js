import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { Terrain } from '@/three/world/Terrain'

// 别墅周边树木清除:院落半径内的树必须被移除,远处的树不受影响
describe('Terrain.clearVegetationNear', () => {
  it('removes trees near villa positions and keeps distant ones', () => {
    const scene = new THREE.Scene()
    const terrain = new Terrain(scene, 'low')
    const m = new THREE.Matrix4()

    const countNear = (cx, cz, radius) => {
      let near = 0
      terrain.treePairs.forEach(([trunkMesh]) => {
        for (let i = 0; i < trunkMesh.count; i++) {
          trunkMesh.getMatrixAt(i, m)
          // 只统计可见(未被移除)的树
          if (Math.abs(m.elements[0]) < 0.001) continue
          const x = m.elements[12]
          const z = m.elements[14]
          const dx = x - cx
          const dz = z - cz
          if (dx * dx + dz * dz < radius * radius) near++
        }
      })
      return near
    }

    const villaPos = [{ x: 0, z: 0 }, { x: 26, z: 30 }]
    const before0 = countNear(0, 0, 17)
    const before1 = countNear(26, 30, 17)
    const total = terrain.treePairs.reduce((sum, [t]) => sum + t.count, 0)

    terrain.clearVegetationNear(villaPos, 17)

    expect(countNear(0, 0, 17)).toBe(0)
    expect(countNear(26, 30, 17)).toBe(0)
    // 清除数量 = 原本在半径内的树;远处的树不受影响
    const remaining = terrain.treePairs.reduce((sum, [t]) => {
      let visible = 0
      for (let i = 0; i < t.count; i++) {
        t.getMatrixAt(i, m)
        const s = Math.abs(m.elements[0]) > 0.001 ? 1 : 0
        visible += s
      }
      return sum + visible
    }, 0)
    expect(remaining).toBe(total - before0 - before1)
    terrain.dispose()
  })
})
