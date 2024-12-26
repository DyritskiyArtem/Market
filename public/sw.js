self.addEventListener('push', event => {
    const data = event.data.json();
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/favicon/favicon.ico', // Optional: Add a path to an icon
    });
});