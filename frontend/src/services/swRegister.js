/* ============================================================
   services/swRegister.js  —  registra o Service Worker e
   envia o token para ele começar a monitorar agendamentos
   ============================================================ */

export async function registerSW(token) {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers não suportados neste navegador.');
    return;
  }

  try {
    // solicita permissão de notificação
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      console.warn('Permissão de notificação negada pelo usuário.');
      return;
    }

    // registra o SW
    const reg = await navigator.serviceWorker.register('/serviceWorker.js');
    console.log('[SW] Registrado com sucesso.');

    // espera o SW estar pronto e envia o token
    const ready = await navigator.serviceWorker.ready;
    ready.active?.postMessage({ type: 'START_NOTIFICATIONS', token });

    // se já existe um controller, envia direto também
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SET_TOKEN', token });
    }
  } catch (err) {
    console.error('[SW] Erro ao registrar:', err);
  }
}

/* atualiza o token quando faz re-login */
export function updateSWToken(token) {
  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SET_TOKEN', token });
  }
}
