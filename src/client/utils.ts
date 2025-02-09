import swURL from 'service-worker:workers/sw';

function onControllerChange() {
  return new Promise<void>((resolve) => {
    navigator.serviceWorker.addEventListener(
      'controllerchange',
      () => resolve(),
      { once: true },
    );
  });
}

export async function addServiceWorker() {
  if (!__PRODUCTION__) return;
  // Firefox in private browsing doesn't support service workers
  if (!navigator.serviceWorker) return;
  navigator.serviceWorker.register(swURL);
  let hadPreviousController = !!navigator.serviceWorker.controller;

  while (true) {
    await onControllerChange();

    // Don't reload for the first controller (eg initial sw registration).
    if (hadPreviousController) {
      // Reload all tabs when there's an update.
      // This only happens when activatePendingSw() is called.
      location.reload();
      return;
    }

    hadPreviousController = true;
  }
}

export async function swUpdatePending(): Promise<boolean> {
  // Firefox in private browsing doesn't support service workers
  if (!navigator.serviceWorker) return false;
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return false;
  return !!reg.waiting;
}

export async function activatePendingSw(): Promise<void> {
  // Firefox in private browsing doesn't support service workers
  if (!navigator.serviceWorker) return;
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg || !reg.waiting) throw Error('No pending service worker');
  reg.waiting.postMessage('skipWaiting');
}
