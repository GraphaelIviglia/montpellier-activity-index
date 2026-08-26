/* Chez nous — service worker.
 *
 * The app is a handful of static files and stores everything in localStorage,
 * so caching the shell is enough to make it work with no network at all.
 * Bump CACHE when any of those files change: the old cache is then dropped.
 */

var CACHE = "chez-nous-v18";

var SHELL = [
  ".",
  "index.html",
  "config.js",
  "manifest.webmanifest",
  "icon-192.png",
  "icon-512.png",
  "icon-maskable-512.png",
  "apple-touch-icon.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE)
      .then(function (cache) { return cache.addAll(SHELL); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.map(function (k) {
          return k === CACHE ? null : caches.delete(k);
        }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

/* Network first, cache as the fallback: an online visit always picks up a new
 * version, an offline one still opens. Navigations fall back to the shell. */
self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      })
      .catch(function () {
        return caches.match(req).then(function (hit) {
          if (hit) return hit;
          if (req.mode === "navigate") return caches.match("index.html");
          return Response.error();
        });
      })
  );
});

/* ---------- rappel des vitamines ----------
 *
 * La poussée arrive sans contenu : on relit l'état avant d'afficher, pour ne
 * pas annoncer un oubli qui vient d'être réparé. Si la lecture échoue, on
 * affiche quand même un rappel prudent — mieux vaut un rappel de trop qu'un
 * oubli. */

var CFG_URL = "config.js";

function todayIn(tz) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit"
  }).format(new Date());
}

async function vitaminesDonneesAujourdhui() {
  var src = await (await fetch(CFG_URL, { cache: "no-store" })).text();
  var url = (src.match(/SUPABASE_URL:\s*"([^"]*)"/) || [])[1];
  var key = (src.match(/SUPABASE_ANON_KEY:\s*"([^"]*)"/) || [])[1];
  var foyer = (src.match(/FOYER:\s*"([^"]*)"/) || [])[1] || "foyer";
  if (!url || !key) return null;

  var day = todayIn("Europe/Paris");
  var r = await fetch(
    url.replace(/\/+$/, "") + "/rest/v1/chez_nous_events?household=eq." +
    encodeURIComponent(foyer) + "&task_id=eq.vitamines&at=like." +
    encodeURIComponent(day) + "*&select=id&limit=1",
    { headers: { apikey: key, Authorization: "Bearer " + key } }
  );
  if (!r.ok) return null;
  return (await r.json()).length > 0;
}

self.addEventListener("push", function (event) {
  event.waitUntil((async function () {
    var done = null;
    try { done = await vitaminesDonneesAujourdhui(); } catch (e) {}
    if (done === true) return;   /* quelqu'un les a données entre-temps */

    await self.registration.showNotification("Vitamines de Sacha", {
      body: done === null
        ? "Pas de trace des vitamines aujourd’hui."
        : "Personne ne les a notées aujourd’hui.",
      icon: "icon-192.png",
      badge: "icon-192.png",
      tag: "rappel-vitamines",
      renotify: false,
      data: { url: "./" }
    });
  })());
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true })
    .then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if ("focus" in list[i]) return list[i].focus();
      }
      return self.clients.openWindow("./");
    }));
});
