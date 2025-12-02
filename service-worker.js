
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Intercept the share target POST request
  if (url.pathname === '/share-target/' && event.request.method === 'POST') {
    event.respondWith((async () => {
      try {
        const formData = await event.request.formData();
        const mediaFile = formData.get('media');

        if (mediaFile) {
          // Store the shared file in a cache so the client page can retrieve it
          const cache = await caches.open('share-target-cache');
          // Create a synthetic response to store the file content
          await cache.put('shared-image', new Response(mediaFile, {
             headers: { 'Content-Type': mediaFile.type }
          }));
        }
        
        // Redirect back to the main app with a query param indicating a share occurred
        return Response.redirect('/?shared=true', 303);
      } catch (e) {
        console.error('Share target error:', e);
        return Response.redirect('/?error=share_failed', 303);
      }
    })());
  }
});

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});
