// ── notifications.js ─────────────────────────────────────────────────────────
// Helper para registrar o SW, pedir permissao e agendar/cancelar alarmes.
// Todas as funcoes sao async e retornam { ok, error }.
// ─────────────────────────────────────────────────────────────────────────────

const SW_PATH = '/sw.js'
const MINUTES_BEFORE = 30

// ── Registro do Service Worker ────────────────────────────────────────────────
export async function registerSW() {
  if (!('serviceWorker' in navigator)) return { ok: false, error: 'SW nao suportado' }
  try {
    const reg = await navigator.serviceWorker.register(SW_PATH, { scope: '/' })
    await navigator.serviceWorker.ready
    return { ok: true, registration: reg }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

// ── Pedido de permissao de notificacao ────────────────────────────────────────
export async function requestPermission() {
  if (!('Notification' in window)) return { ok: false, error: 'Notificacoes nao suportadas' }
  if (Notification.permission === 'granted') return { ok: true, permission: 'granted' }
  if (Notification.permission === 'denied') return { ok: false, error: 'Permissao negada pelo usuario' }
  const result = await Notification.requestPermission()
  return { ok: result === 'granted', permission: result }
}

// ── Obtem SW ativo ────────────────────────────────────────────────────────────
async function getSW() {
  if (!navigator.serviceWorker.controller) return null
  return navigator.serviceWorker.controller
}

// ── Calcula o horario de disparo (dueDate - 30 min) ───────────────────────────
function calcFireAt(dateStr, timeStr) {
  // dateStr: 'YYYY-MM-DD', timeStr: 'HH:MM'
  const [y, m, d] = dateStr.split('-').map(Number)
  const [h, min] = timeStr.split(':').map(Number)
  const due = new Date(y, m - 1, d, h, min, 0)
  return due.getTime() - MINUTES_BEFORE * 60 * 1000
}

// ── Agenda um alarme para uma tarefa ─────────────────────────────────────────
// todo: { id, title, date, time, person }
export async function scheduleTodoAlarm(todo) {
  if (!todo.date || !todo.time) return { ok: false, error: 'Sem data/hora' }
  if (Notification.permission !== 'granted') return { ok: false, error: 'Sem permissao' }

  const fireAt = calcFireAt(todo.date, todo.time)
  const now = Date.now()
  if (fireAt <= now) return { ok: false, error: 'Horario ja passou' }

  const alarm = {
    id: 'todo-' + todo.id,
    title: 'Lembrete: ' + todo.title,
    body: 'Para ' + todo.person + ' em 30 minutos! (' + todo.time + ')',
    fireAt,
  }

  const sw = await getSW()
  if (sw) {
    sw.postMessage({ type: 'SCHEDULE', alarms: [alarm] })
    return { ok: true, alarm }
  }

  // Fallback: usa setTimeout se SW nao disponivel (funciona apenas com aba aberta)
  const delay = fireAt - now
  const timerId = setTimeout(() => {
    new Notification(alarm.title, {
      body: alarm.body,
      icon: '/icon-192.png',
      tag: alarm.id,
    })
  }, delay)
  // Armazena no sessionStorage para poder cancelar
  const timers = JSON.parse(sessionStorage.getItem('notif_timers') || '{}')
  timers[alarm.id] = timerId
  sessionStorage.setItem('notif_timers', JSON.stringify(timers))
  return { ok: true, alarm, fallback: true }
}

// ── Cancela o alarme de uma tarefa ────────────────────────────────────────────
export async function cancelTodoAlarm(todoId) {
  const alarmId = 'todo-' + todoId
  const sw = await getSW()
  if (sw) {
    sw.postMessage({ type: 'CANCEL', alarmId })
  }
  // Cancela fallback setTimeout se existir
  const timers = JSON.parse(sessionStorage.getItem('notif_timers') || '{}')
  if (timers[alarmId]) {
    clearTimeout(timers[alarmId])
    delete timers[alarmId]
    sessionStorage.setItem('notif_timers', JSON.stringify(timers))
  }
  return { ok: true }
}

// ── Re-agenda todos os alarmes (chamado no boot do app) ───────────────────────
export async function rescheduleAllAlarms(todos) {
  if (!todos || !todos.length) return
  if (Notification.permission !== 'granted') return
  const sw = await getSW()
  if (!sw) return

  const now = Date.now()
  const alarms = todos
    .filter(t => !t.done && t.date && t.time)
    .map(t => ({
      id: 'todo-' + t.id,
      title: 'Lembrete: ' + t.title,
      body: 'Para ' + t.person + ' em 30 minutos! (' + t.time + ')',
      fireAt: calcFireAt(t.date, t.time),
    }))
    .filter(a => a.fireAt > now)

  if (alarms.length) {
    sw.postMessage({ type: 'SCHEDULE', alarms })
  }
}

// ── Verifica se o browser suporta notificacoes ────────────────────────────────
export function isNotificationSupported() {
  return 'Notification' in window && 'serviceWorker' in navigator
}

export function getPermissionStatus() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission // 'default' | 'granted' | 'denied'
}
