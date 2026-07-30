// 递归释放 three 对象树中的 geometry / material / texture
export function disposeObject3D(root) {
  if (!root) return
  root.traverse(obj => {
    if (obj.geometry) {
      obj.geometry.dispose()
    }
    const materials = Array.isArray(obj.material) ? obj.material : obj.material ? [obj.material] : []
    materials.forEach(material => {
      Object.keys(material).forEach(key => {
        const value = material[key]
        if (value && value.isTexture) {
          value.dispose()
        }
      })
      material.dispose()
    })
  })
}

// 从父级移除并释放
export function removeAndDispose(root) {
  if (!root) return
  if (root.parent) {
    root.parent.remove(root)
  }
  disposeObject3D(root)
}
