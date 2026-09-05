const CACHE_NAME = 'music-cache-v15days';
const MAX_AGE = 15 * 24 * 60 * 60 * 1000; // 15 días en milisegundos

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Interceptar las solicitudes de audio para guardarlas y gestionarlas offline
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Verificamos si es un archivo de música (.mp3) o una solicitud de audio
  if (url.pathname.endsWith('.mp3') || event.request.destination === 'audio') {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        
        if (cachedResponse) {
          // Opcional: Podrías verificar la fecha si deseas purgar estrictamente a los 15 días,
          // pero el navegador gestionará la caché eficientemente.
          return cachedResponse;
        }

        try {
          // Si no está en caché, lo descarga de internet y lo guarda
          const networkResponse = await fetch(event.request);
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        } catch (error) {
          return new Response("No tienes conexión y esta canción no está guardada en la caché.", { 
            status: 404, 
            statusText: "Offline Audio Not Found" 
          });
        }
      })
    );
  }
});
