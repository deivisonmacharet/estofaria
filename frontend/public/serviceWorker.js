/* ============================================================
   serviceWorker.js  —  Service Worker para notificações
   
   Como funciona:
   - A cada 2 minutos busca /appointments/upcoming no backend
   - Compara scheduled_at com agora
   - Se faltam ≤ 30 min e ainda não foi notificado → dispara
     Notification nativa do navegador
   - Funciona mesmo com a aba fechada (em PWA instalado)
   ============================================================ */

const API = '';                              // traefik strip /api no backend
const CHECK_INTERVAL = 2 * 60 * 1000;           // a cada 2 min
const NOTIFY_WINDOW  = 31 * 60 * 1000;          // 31 min antes (margem de 1 min)
const notifiedIds    = new Set();                // evita notificar duas vezes

/* ── instalação ── */
self.addEventListener('install', (e) => {
  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

/* ── mensagem do main thread: "startNotifications" + token ── */
let authToken = null;

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SET_TOKEN') {
    authToken = event.data.token;
  }
  if (event.data?.type === 'START_NOTIFICATIONS') {
    authToken = event.data.token;
    checkAppointments();                         // primeira verificação imediata
    setInterval(checkAppointments, CHECK_INTERVAL);
  }
});

/* ── função principal ── */
async function checkAppointments() {
  if (!authToken) return;                        // sem token → não busca

  try {
    const res = await fetch(`${API}/appointments/upcoming`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!res.ok) return;

    const appointments = await res.json();
    const now = Date.now();

    for (const apt of appointments) {
      if (notifiedIds.has(apt.id)) continue;     // já notificou

      const aptTime = new Date(apt.scheduled_at).getTime();
      const diff    = aptTime - now;             // ms até o compromisso

      // entre 0 e 31 min → notifica
      if (diff > 0 && diff <= NOTIFY_WINDOW) {
        notifiedIds.add(apt.id);
        const minLeft = Math.round(diff / 60000);
        showNotification(apt, minLeft);
      }
    }
  } catch (err) {
    console.warn('[SW] Erro ao buscar agendamentos:', err);
  }
}

/* ── dispara a notificação ── */
function showNotification(apt, minLeft) {
  const title = `⏰ Agendamento em ${minLeft} min`;
  const body  =
    `Cliente: ${apt.client_name}\n` +
    (apt.category_name ? `Serviço: ${apt.category_name}\n` : '') +
    (apt.client_phone  ? `Fone: ${apt.client_phone}\n`     : '') +
    (apt.notes         ? `Obs: ${apt.notes}`               : '');

  self.registration.showNotification(title, {
    body,
    icon:    '/favicon.ico',
    badge:   '/favicon.ico',
    vibrate: [200, 100, 200],
    tag:     `apt-${apt.id}`,                    // evita duplicatas no dispositivo
    requireInteraction: true                     // fica até o usuário dispensar
  });
}

/* ── click na notificação → abre a aba do app ── */
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin)) {
          client.focus();
          return;
        }
      }
      // se não há aba aberta, abre uma nova
      return self.clients.openWindow(self.location.origin + '/admin/agenda');
    })
  );
});
