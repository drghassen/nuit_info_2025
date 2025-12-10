/**
 * ============================================================================
 * ECOTRACK IOT - REAL-TIME DASHBOARD UPDATER
 * ============================================================================
 * Handles WebSocket connection and real-time data updates
 * Integrates with dashboard-core.js for live IoT monitoring
 */

class DashboardRealtimeUpdater {
    constructor() {
        this.wsClient = null;
        this.isInitialized = false;
        this.updateInterval = null;
        this.connectionStatus = 'disconnected';
    }

    /**
     * Initialize real-time updates
     */
    init() {
        if (this.isInitialized) {
            console.warn('Dashboard realtime already initialized');
            return;
        }

        // Initialize WebSocket connection
        this.initWebSocket();

        // Fallback: HTTP polling if WebSocket fails
        this.startFallbackPolling();

        this.isInitialized = true;
        console.log('✅ Dashboard real-time updates initialized');
    }

    /**
     * Initialize WebSocket connection for real-time updates
     */
    initWebSocket() {
        if (typeof IoTWebSocketClient === 'undefined') {
            console.warn('IoTWebSocketClient not loaded, using HTTP polling only');
            return;
        }

        this.wsClient = new IoTWebSocketClient('/ws/dashboard/', {
            onOpen: () => {
                this.connectionStatus = 'connected';
                this.updateConnectionIndicator('connected');
                console.log('✅ WebSocket connected to dashboard');

                // Show success notification
                if (typeof notificationSystem !== 'undefined') {
                    notificationSystem.addNotification(
                        'success',
                        'Connexion temps réel',
                        'Dashboard connecté en temps réel',
                        null
                    );
                }

                // Stop HTTP polling when WebSocket is active
                this.stopFallbackPolling();
            },

            onMessage: (data) => {
                console.log('📡 Received real-time data:', data);
                this.handleDataUpdate(data);
            },

            onError: (error) => {
                console.error('❌ WebSocket error:', error);
                this.connectionStatus = 'error';
                this.updateConnectionIndicator('error');
            },

            onClose: () => {
                console.warn('⚠️ WebSocket disconnected');
                this.connectionStatus = 'disconnected';
                this.updateConnectionIndicator('disconnected');

                // Restart HTTP polling as fallback
                this.startFallbackPolling();
            },

            onMaxReconnectAttempts: () => {
                console.error('❌ Max reconnection attempts reached');
                if (typeof notificationSystem !== 'undefined') {
                    notificationSystem.addNotification(
                        'danger',
                        'Connexion perdue',
                        'Impossible de se reconnecter au serveur. Les données ne sont plus en temps réel.',
                        null
                    );
                }
            }
        });

        // Start connection
        this.wsClient.connect();
    }

    /**
     * Handle incoming data updates
     * @param {Object} data - Updated dashboard data
     */
    handleDataUpdate(data) {
        try {
            // Update dashboard using DashboardCore
            if (typeof DashboardCore !== 'undefined' && DashboardCore.updateData) {
                DashboardCore.updateData(data);
            } else {
                // Fallback to global updateData function
                if (typeof updateData === 'function') {
                    updateData(data);
                } else {
                    console.warn('No update function available');
                }
            }

            // Update last update timestamp
            this.updateLastUpdateTime();

            // Flash indicator to show data received
            this.flashUpdateIndicator();

        } catch (error) {
            console.error('Error handling data update:', error);
        }
    }

    /**
     * Start HTTP polling as fallback when WebSocket is unavailable
     */
    startFallbackPolling() {
        // Don't poll if WebSocket is connected
        if (this.connectionStatus === 'connected') {
            return;
        }

        // Clear existing interval
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        console.log('🔄 Starting HTTP polling (fallback)...');

        // Poll every 5 seconds
        this.updateInterval = setInterval(() => {
            this.fetchLatestData();
        }, 5000);

        // Immediate first fetch
        this.fetchLatestData();
    }

    /**
     * Stop HTTP polling
     */
    stopFallbackPolling() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            console.log('⏸️ HTTP polling stopped (WebSocket active)');
        }
    }

    /**
     * Fetch latest data via HTTP (fallback)
     */
    async fetchLatestData() {
        try {
            const response = await fetch('/api/dashboard-data/', {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            this.handleDataUpdate(data);

        } catch (error) {
            console.error('Error fetching data:', error);
            this.updateConnectionIndicator('error');
        }
    }

    /**
     * Update connection status indicator in UI
     * @param {string} status - 'connected', 'disconnected', or 'error'
     */
    updateConnectionIndicator(status) {
        const indicator = document.getElementById('connection-status');
        if (!indicator) return;

        indicator.className = 'connection-status';

        switch (status) {
            case 'connected':
                indicator.classList.add('status-connected');
                indicator.innerHTML = '<i class="fas fa-circle"></i> Temps réel';
                indicator.title = 'Connecté en temps réel via WebSocket';
                break;
            case 'disconnected':
                indicator.classList.add('status-disconnected');
                indicator.innerHTML = '<i class="fas fa-circle"></i> Polling HTTP';
                indicator.title = 'Mise à jour par polling HTTP (5s)';
                break;
            case 'error':
                indicator.classList.add('status-error');
                indicator.innerHTML = '<i class="fas fa-exclamation-circle"></i> Erreur';
                indicator.title = 'Erreur de connexion';
                break;
        }
    }

    /**
     * Flash the update indicator to show data refresh
     */
    flashUpdateIndicator() {
        const indicator = document.getElementById('update-flash');
        if (indicator) {
            indicator.classList.add('flash-active');
            setTimeout(() => {
                indicator.classList.remove('flash-active');
            }, 500);
        }
    }

    /**
     * Update last update timestamp
     */
    updateLastUpdateTime() {
        const lastUpdateEl = document.getElementById('last-update');
        if (lastUpdateEl) {
            const now = new Date();
            lastUpdateEl.textContent = now.toLocaleTimeString('fr-FR');
        }
    }

    /**
     * Disconnect and cleanup
     */
    destroy() {
        if (this.wsClient) {
            this.wsClient.disconnect();
        }
        this.stopFallbackPolling();
        this.isInitialized = false;
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRealtimeUpdates);
} else {
    initRealtimeUpdates();
}

function initRealtimeUpdates() {
    // Wait a bit to ensure other scripts are loaded
    setTimeout(() => {
        const realtimeUpdater = new DashboardRealtimeUpdater();
        realtimeUpdater.init();

        // Make globally available
        window.realtimeUpdater = realtimeUpdater;

        console.log('✅ Real-time dashboard updates active');
    }, 500);
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DashboardRealtimeUpdater };
}
