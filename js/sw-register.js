// Registers the service worker after the page has finished loading so it
// never competes with the initial render/preload for bandwidth or CPU.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {
      // Fails silently on file:// or restricted contexts — the experience
      // still works perfectly without offline caching, it just won't be
      // instant on a second visit.
    });
  });
}
