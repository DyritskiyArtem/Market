if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(swReg => {
            console.log('Service Worker is registered', swReg);
        })
        .catch(error => {
            console.error('Service Worker Error', error);
        });
}

const publicVapidKey = "BIjRegWKfB5OcwkmtDrm1eBeNgotE6xy21OZYAs4DH8Sn2DIakFe0K4zyFIDxgXErBrYFq8hIEWsbnC1kTLDCH8";

navigator.serviceWorker.ready.then(swReg => {
    return swReg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
    });
}).then(subscription => {
    // Send subscription object to server
    return fetch('/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
            'Content-Type': 'application/json',
        },
    });
}).catch(error => {
    console.error('Subscription failed:', error);
});
 
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
 
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}