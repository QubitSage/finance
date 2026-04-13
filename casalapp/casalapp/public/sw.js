// ── Casal App Service Worker ─────────────────────────────────────────────────
// Versão: 1.0.0
// Funcionalidades:
//   • Cache offline (Cache-First para assets, Network-First para API)
//   • Recebe push notifications do servidor (futuro)
//   • Dispara notificações agendadas localmente via postMessage
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_NAME = 'casal-app-v1'
const STATIC_ASSETS = ['/', '/index.html']

// ── Install: pre-cache shell ──────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// ── Activate: limpa caches antigos ───────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// ── Fetch: Network-first com fallback para cache ──────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event
  if (request.method !== 'GET') return
  // Não intercepta requests do Supabase/APIs externas
  if (request.url.includes('supabase') || request.url.includes('googleapis')) return
  event.respondWith(
    fetch(request)
      .then(response => {
        // Armazena no cache apenas respostas válidas
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
        }
        return response
      })
      .catch(() => caches.match(request).then(cached => cached || caches.match('/index.html')))
  )
})

// ── Push: notificações vindas do servidor ─────────────────────────────────────
self.addEventListener('push', event => {
  let data = { title: 'Casal App', body: 'Nova notificação', tag: 'default' }
  try { data = event.data ? event.data.json() : data } catch (e) {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-96.png',
      tag: data.tag || 'default',
      data: data.url || '/',
      vibrate: [200, 100, 200],
      requireInteraction: true,
    })
  )
})

// ── notificationclick: abre o app na tarefa certa ────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = event.notification.data || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const existing = clients.find(c => c.url.includes(self.location.origin))
      if (existing) return existing.focus()
      return self.clients.openWindow(url)
    })
  )
})

// ── Message: recebe alarmes agendados do cliente ──────────────────────────────
// O cliente envia { type: 'SCHEDULE', alarms: [{id, title, body, fireAt}] }
// O SW guarda no IDB e usa setInterval para verificar
const ALARM_STORE = 'casal-alarms'

function openAlarmDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(ALARM_STORE, 1)
    req.onupgradeneeded = e => {
      e.target.result.createObjectStore('alarms', { keyPath: 'id' })
    }
    req.onsuccess = e => resolve(e.target.result)
    req.onerror = e => reject(e.target.error)
  })
}

async function saveAlarms(alarms) {
  const db = await openAlarmDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('alarms', 'readwrite')
    const store = tx.objectStore('alarms')
    store.clear()
    alarms.forEach(a => store.put(a))
    tx.oncomplete = resolve
    tx.onerror = e => reject(e.target.error)
  })
}

async function getAllAlarms() {
  const db = await openAlarmDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('alarms', 'readonly')
    const store = tx.objectStore('alarms')
    const req = store.getAll()
    req.onsuccess = () => resolve(req.result || [])
    req.onerror = e => reject(e.target.error)
  })
}

async function removeAlarm(id) {
  const db = await openAlarmDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('alarms', 'readwrite')
    tx.objectStore('alarms').delete(id)
    tx.oncomplete = resolve
    tx.onerror = e => reject(e.target.error)
  })
}

// Verifica e dispara alarmes vencidos
async function checkAlarms() {
  const now = Date.now()
  const alarms = await getAllAlarms()
  for (const alarm of alarms) {
    if (alarm.fireAt <= now) {
      await removeAlarm(alarm.id)
      self.registration.showNotification(alarm.title, {
        body: alarm.body,
        icon: '/icon-192.png',
        badge: '/icon-96.png',
        tag: 'todo-' + alarm.id,
        data: '/todo',
        vibrate: [200, 100, 200, 100, 200],
        requireInteraction: true,
        actions: [
          { action: 'open', title: '📋 Ver tarefa' },
          { action: 'dismiss', title: 'Dispensar' },
        ],
      })
    }
  }
}

// Inicia o loop de checagem a cada 30 segundos
setInterval(checkAlarms, 30000)

self.addEventListener('message', async event => {
  const { type, alarms, alarmId } = event.data || {}
  if (type === 'SCHEDULE') {
    await saveAlarms(alarms)
    // Checa imediatamente
    await checkAlarms()
    event.source && event.source.postMessage({ type: 'SCHEDULE_OK', count: alarms.length })
  }
  if (type === 'CANCEL') {
    await removeAlarm(alarmId)
  }
  if (type === 'GET_ALARMS') {
    const alarms = await getAllAlarms()
    event.source && event.source.postMessage({ type: 'ALARMS', alarms })
  }
  if (type === 'PING') {
    event.source && event.source.postMessage({ type: 'PONG' })
  }
})
