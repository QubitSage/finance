let preset = null
let pendingRegistro = null

export function setNavPreset(value) {
  preset = value
}

export function consumeNavPreset() {
  const value = preset
  preset = null
  return value
}

export function setPendingRegistro(saida) {
  pendingRegistro = saida
}

export function consumePendingRegistro() {
  const value = pendingRegistro
  pendingRegistro = null
  return value
}
