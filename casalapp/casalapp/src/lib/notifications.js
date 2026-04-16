// notifications.js - Capacitor LocalNotifications + Web fallback
let _LN = null;
let _Cap = null;

async function getCap() {
    if (_Cap !== null) return _Cap;
    try { const m = await import('@capacitor/core'); _Cap = m.Capacitor; }
    catch { _Cap = false; }
    return _Cap;
}

async function getLN() {
    if (_LN !== null) return _LN;
    try { const m = await import('@capacitor/local-notifications'); _LN = m.LocalNotifications; }
    catch { _LN = false; }
    return _LN;
}

export function isNotificationSupported() { return true; }

export function getPermissionStatus() {
    if (typeof window === 'undefined') return 'denied';
    if ('Notification' in window) return Notification.permission;
    return 'default';
}

export async function requestPermission() {
    try {
          const cap = await getCap();
          const LN = await getLN();
          if (cap && cap.isNativePlatform() && LN) {
                  const r = await LN.requestPermissions();
                  return { ok: r.display === 'granted', status: r.display };
          }
          if ('Notification' in window) {
                  const r = await Notification.requestPermission();
                  return { ok: r === 'granted', status: r };
          }
          return { ok: false, status: 'denied' };
    } catch(e) { return { ok: false, error: e.message }; }
}

function hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h = h & h; }
    return Math.abs(h) || 1;
}

export async function scheduleTodoAlarm(todo) {
    if (!todo.date || !todo.time) return { ok: false, error: 'No date/time' };
    try {
          const dueTime = new Date(todo.date + 'T' + todo.time).getTime();
          const fireAt = dueTime - 30 * 60 * 1000;
          if (fireAt <= Date.now()) return { ok: false, error: 'Time passed' };
          const cap = await getCap();
          const LN = await getLN();
          if (cap && cap.isNativePlatform() && LN) {
                  await LN.schedule({ notifications: [{
                            id: hash(String(todo.id)),
                            title: 'Lembrete: ' + todo.title,
                            body: 'Tarefa de ' + todo.person + ' em 30 minutos! (' + todo.time + ')',
                            schedule: { at: new Date(fireAt) },
                            extra: { todoId: String(todo.id) }
                  }] });
                  return { ok: true };
          }
          if ('Notification' in window && Notification.permission === 'granted') {
                  if (!window._todoTimers) window._todoTimers = {};
                  window._todoTimers[String(todo.id)] = setTimeout(() => {
                            new Notification('Lembrete: ' + todo.title, {
                                        body: 'Tarefa de ' + todo.person + ' em 30 minutos! (' + todo.time + ')',
                                        icon: '/icon.svg'
                            });
                  }, fireAt - Date.now());
                  return { ok: true };
          }
          return { ok: false, error: 'No permission' };
    } catch(e) { return { ok: false, error: e.message }; }
}

export async function cancelTodoAlarm(todoId) {
    try {
          const cap = await getCap();
          const LN = await getLN();
          if (cap && cap.isNativePlatform() && LN) {
                  await LN.cancel({ notifications: [{ id: hash(String(todoId)) }] });
                  return { ok: true };
          }
          if (window._todoTimers?.[String(todoId)]) {
                  clearTimeout(window._todoTimers[String(todoId)]);
                  delete window._todoTimers[String(todoId)];
          }
          return { ok: true };
    } catch(e) { return { ok: false, error: e.message }; }
}

export async function rescheduleAllAlarms(todos) {
    if (!todos?.length) return;
    for (const t of todos) {
          if (!t.done && t.date && t.time) await scheduleTodoAlarm(t);
      }
}

export function registerSW() {}

// ─── Notificação instantânea (para eventos em tempo real) ─────────────────
export async function instantNotify(title, body) {
    try {
        const cap = await getCap();
        const LN = await getLN();
        if (cap && cap.isNativePlatform() && LN) {
            const id = Math.floor(Math.random() * 2000000) + 1000000;
            await LN.schedule({ notifications: [{
                id,
                title,
                body,
                schedule: { at: new Date(Date.now() + 100) },
                smallIcon: 'ic_stat_icon_config_sample',
                iconColor: '#f43f5e',
            }] });
            return { ok: true };
        }
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body, icon: '/icon.svg' });
            return { ok: true };
        }
        return { ok: false, error: 'No permission' };
    } catch(e) { return { ok: false, error: e.message }; }
}

