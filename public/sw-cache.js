const version = 'carpoolv0.1';

self.addEventListener('install', function (event) {
    self.skipWaiting();
    //REMOVE PREIVOUS CACHE
    event.waitUntil(
        caches.keys()
            .then(function (keys) {
                return Promise.all(keys.filter(function (key) {
                    return key !== version;
                }).map(function (key) {
                    return caches.delete(key);
                }));
            }));

    event.waitUntil(
        caches.open(version)
            .then(function (cache) {
                return cache.addAll([

                    // 'index.html',
                    'icons/aashish.jpg',
                    'icons/rohan.jpg',
                    'icons/pavan.jpg',
                    'icons/WW89650_low.jpg',
                    // '/app.js',
                    '/firebasejs/firebaseapp.js',
                    '/bootstrap.min.js',
                    '/hopscotch.min.js',
                    '/jquery.min.js',
                    // '/mydetails.html',
                    // '/mydetails.js',
                    // '/requestride.html',
                    // '/requestride.js',
                    '/fonts/glyphicons-halflings-regular.ttf',
                    '/fonts/glyphicons-halflings-regular.woff',
                    '/fonts/glyphicons-halflings-regular.woff2'


                ]);
            })
    );

});

self.addEventListener('activate', function (event) {

    console.log('SW now ready to handle fetches!');
    return self.clients.claim();
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request)
            .then(function (res) {
                return res || fetch(event.request);


            })
    );
});
