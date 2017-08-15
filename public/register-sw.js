if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw-cache.js').then(reg => {       
        reg.update();
    });
}
