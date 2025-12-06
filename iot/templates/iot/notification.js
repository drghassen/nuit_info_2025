// ==================== SYSTÈME DE NOTIFICATIONS ====================
class NotificationSystem {
    constructor() {
        this.notifications = this.loadFromStorage();
        this.maxMiniToasts = 3;
        this.maxNotifications = 50;
        this.miniToastDuration = 5000;
        this.notificationCache = new Map();
        this.cacheDuration = 300000; // 5 minutes
        this.init();
    }

    init() {
        this.updateNotificationBadge();
        this.setupEventListeners();
        this.renderStoredNotifications();
        this.loadNotificationCache();
    }

    loadFromStorage() {
        const stored = localStorage.getItem('iot-notifications');
        return stored ? JSON.parse(stored) : [];
    }

    saveToStorage() {
        localStorage.setItem('iot-notifications', JSON.stringify(this.notifications));
    }

    loadNotificationCache() {
        const cached = localStorage.getItem('notification-cache');
        if (cached) {
            try {
                const cacheData = JSON.parse(cached);
                const now = Date.now();
                for (const [key, timestamp] of Object.entries(cacheData)) {
                    if (now - timestamp < this.cacheDuration) {
                        this.notificationCache.set(key, timestamp);
                    }
                }
            } catch (e) {
                console.error('Erreur de chargement du cache:', e);
            }
        }
    }

    saveNotificationCache() {
        const cacheObj = Object.fromEntries(this.notificationCache);
        localStorage.setItem('notification-cache', JSON.stringify(cacheObj));
    }

    shouldShowNotification(type, value) {
        const cacheKey = `${type}-${Math.round(value)}`;
        const now = Date.now();
        const lastShown = this.notificationCache.get(cacheKey);
       
        if (lastShown && (now - lastShown < this.cacheDuration)) {
            return false;
        }
       
        this.notificationCache.set(cacheKey, now);
        this.saveNotificationCache();
        return true;
    }

    cleanupNotificationCache() {
        const now = Date.now();
        for (const [key, timestamp] of this.notificationCache.entries()) {
            if (now - timestamp > this.cacheDuration) {
                this.notificationCache.delete(key);
            }
        }
        this.saveNotificationCache();
    }

    setupEventListeners() {
        const notificationBtn = document.getElementById('notificationBtn');
        const clearAllBtn = document.getElementById('clearAllBtn');
        
        if (notificationBtn) {
            notificationBtn.style.cursor = 'pointer';
            notificationBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleNotificationsPanel();
            });
        }

        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.markAllAsRead();
            });
        }

        document.addEventListener('click', (e) => {
            const panel = document.getElementById('notificationsPanel');
            const btn = document.getElementById('notificationBtn');
           
            if (panel && panel.classList.contains('active') &&
                !panel.contains(e.target) &&
                !btn.contains(e.target)) {
                panel.classList.remove('active');
            }
        });
    }

    addNotification(type, title, message, value = null) {
        if (value !== null && !this.shouldShowNotification(type, value)) {
            console.log(`Notification "${title}" ignorée (déjà affichée récemment)`);
            return null;
        }
       
        const id = Date.now();
        const notification = {
            id,
            type,
            title,
            message,
            value,
            time: new Date().toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            }),
            timestamp: Date.now(),
            read: false
        };
        
        this.notifications.unshift(notification);
        if (this.notifications.length > this.maxNotifications) {
            this.notifications = this.notifications.slice(0, this.maxNotifications);
        }
        
        this.saveToStorage();
        this.updateNotificationBadge();
        this.renderMiniToast(notification);
        this.renderNotificationsList();
        return notification;
    }

    renderMiniToast(notification) {
        const container = document.getElementById('miniToastsContainer');
        if (!container) return;
       
        const toast = document.createElement('div');
        toast.className = `mini-toast ${notification.type}`;
        toast.dataset.id = notification.id;
       
        toast.innerHTML = `
            <div class="mini-toast-content">
                <div class="mini-toast-icon">
                    <i class="fas ${this.getIconForType(notification.type)}"></i>
                </div>
                <div class="mini-toast-text">
                    <div class="mini-toast-title">${notification.title}</div>
                    <div class="mini-toast-message">${notification.message}</div>
                </div>
                <div class="mini-toast-time">${notification.time}</div>
            </div>
        `;
        
        container.insertBefore(toast, container.firstChild);
        const toasts = container.querySelectorAll('.mini-toast');
        if (toasts.length > this.maxMiniToasts) {
            toasts[toasts.length - 1].remove();
        }
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => toast.remove(), 300);
            }
        }, this.miniToastDuration);
        
        toast.addEventListener('click', () => {
            this.markAsRead(notification.id);
            toast.remove();
        });
    }

    renderStoredNotifications() {
        const unreadNotifications = this.notifications
            .filter(n => !n.read)
            .slice(0, this.maxMiniToasts)
            .reverse();
        unreadNotifications.forEach(notification => {
            this.renderMiniToast(notification);
        });
        this.renderNotificationsList();
    }

    renderNotificationsList() {
        const list = document.getElementById('notificationsList');
        const count = document.getElementById('notificationCount');
       
        if (!list || !count) return;
       
        const allNotifications = this.notifications;
        count.textContent = allNotifications.length;
       
        list.innerHTML = allNotifications.map(notification => `
            <div class="notification-item ${notification.type} ${notification.read ? 'read' : ''}" data-id="${notification.id}">
                <div class="notification-item-header">
                    <div class="notification-item-title">
                        <i class="fas ${this.getIconForType(notification.type)} me-2"></i>
                        ${notification.title}
                    </div>
                    <div class="notification-item-time">${notification.time}</div>
                </div>
                <div class="notification-item-message">${notification.message}</div>
            </div>
        `).join('');
       
        if (allNotifications.length === 0) {
            list.innerHTML = `
                <div class="text-center py-5 opacity-50">
                    <i class="fas fa-bell-slash fa-2x mb-3"></i>
                    <p>Aucune notification</p>
                </div>
            `;
        }
       
        list.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const id = parseInt(item.dataset.id);
                this.markAsRead(id);
                setTimeout(() => {
                    this.toggleNotificationsPanel();
                }, 300);
            });
        });
    }

    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            this.saveToStorage();
            this.updateNotificationBadge();
            this.renderNotificationsList();
        }
    }

    markAllAsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
       
        this.saveToStorage();
        this.updateNotificationBadge();
        this.renderNotificationsList();
       
        const container = document.getElementById('miniToastsContainer');
        if (container) {
            container.innerHTML = '';
        }
    }

    updateNotificationBadge() {
        const badge = document.getElementById('notificationBadge');
        const btn = document.getElementById('notificationBtn');
       
        if (!badge || !btn) return;
       
        const unreadCount = this.notifications.filter(n => !n.read).length;
       
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            badge.style.display = 'flex';
            btn.classList.add('has-notifications');
        } else {
            badge.style.display = 'none';
            btn.classList.remove('has-notifications');
        }
    }

    toggleNotificationsPanel() {
        const panel = document.getElementById('notificationsPanel');
        if (!panel) return;
       
        const isActive = panel.classList.contains('active');
       
        if (!isActive) {
            this.renderNotificationsList();
        }
       
        panel.classList.toggle('active');
    }

    getIconForType(type) {
        switch(type) {
            case 'danger': return 'fa-exclamation-circle';
            case 'warning': return 'fa-triangle-exclamation';
            case 'info': return 'fa-info-circle';
            default: return 'fa-bell';
        }
    }
}