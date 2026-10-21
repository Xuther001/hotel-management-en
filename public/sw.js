self.addEventListener('push', event => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : 'A room status has changed.' };
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Hospitality Group', {
      body: data.body || 'A room has been marked Clean.',
      icon: '/icon.svg',
      badge: '/icon.svg',
      data: { url: data.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil((async () => {
    const clientsList = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });

    for (const client of clientsList) {
      if (client.url.startsWith(self.location.origin) && 'focus' in client) {
        await client.focus();
        if ('navigate' in client) await client.navigate(target);
        return;
      }
    }

    if (self.clients.openWindow) await self.clients.openWindow(target);
  })());
});
