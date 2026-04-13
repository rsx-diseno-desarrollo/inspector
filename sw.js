// sw.js
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    )
  );
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  if (
    requestUrl.pathname === '/' ||
    requestUrl.pathname.endsWith('index.html')
  ) {
    event.respondWith(
      fetch(event.request).catch(() => new Response(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Inspector - Sin conexión</title>
          <style>
            body {
              font-family: system-ui, Arial, sans-serif;
              background: #ffffff;
              color: #000;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .container {
              text-align: center;
              max-width: 320px;
            }
            h1 {
              color: #0EC701;
              font-size: 22px;
            }
            p {
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Sin conexión</h1>
            <p>No se puede cargar Inspector en este momento.<br>
               Conéctate a la red para continuar.</p>
          </div>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      }))
    );
  } else {
    event.respondWith(fetch(event.request));
  }
});
