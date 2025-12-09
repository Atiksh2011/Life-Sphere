// In initializeCore() method:
async initializeCore() {
    // ... existing code ...
    
    // Register service worker
    await this.registerServiceWorker();
    
    // ... rest of code ...
}

async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered:', registration);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New content is available
                        this.showUpdateNotification();
                    }
                });
            });
            
            // Handle messages from service worker
            navigator.serviceWorker.addEventListener('message', event => {
                if (event.data.type === 'SERVICE_WORKER_ERROR') {
                    console.error('Service Worker Error:', event.data.error);
                }
            });
            
        } catch (error) {
            console.warn('Service Worker registration failed:', error);
        }
    }
}

showUpdateNotification() {
    if (confirm('A new version is available. Reload to update?')) {
        window.location.reload();
    }
}

// Check for background sync support
if ('sync' in registration) {
    // Register background sync
    registration.sync.register('sync-data');
}

// Request notification permission
async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Notification permission granted');
            this.subscribeToPush();
        }
    }
}
