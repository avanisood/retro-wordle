const CACHE_NAME = 'retro-wordle-v1';
const urlsToCache = [
  '/retro-wordle/',
  '/retro-wordle/index.html',
  '/retro-wordle/character.html',
  '/retro-wordle/game.html',
  '/retro-wordle/styles.css',
  '/retro-wordle/title.js',
  '/retro-wordle/character.js',
  '/retro-wordle/game.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});