/**
 * ============================================================================
 * ECOTRACK IOT - AUTH SYSTEM
 * ============================================================================
 * Professional authentication and session management system
 * Handles session timeout, activity tracking, and user security
 */

class ProfessionalAuthSystem {
    constructor() {
        this.sessionStartTime = Date.now();
        this.sessionDuration = 30 * 60 * 1000; // 30 minutes
        this.warningTime = 5 * 60 * 1000; // 5 minutes warning
        this.checkInterval = 60 * 1000; // Check every minute

        this.init();
    }

    init() {
        this.updateSessionDisplay();
        this.startSessionTimer();
        this.setupEventListeners();
    }

    updateSessionDisplay() {
        const now = new Date();
        const sessionStartEl = document.getElementById('sessionStart');
        if (sessionStartEl) {
            sessionStartEl.textContent = now.toLocaleTimeString('fr-FR');
        }
        this.updateCountdown();
    }

    updateCountdown() {
        const elapsed = Date.now() - this.sessionStartTime;
        const remaining = Math.max(0, this.sessionDuration - elapsed);

        const minutes = Math.floor(remaining / (60 * 1000));
        const seconds = Math.floor((remaining % (60 * 1000)) / 1000);

        const countdownElement = document.getElementById('sessionCountdown');
        if (countdownElement) {
            countdownElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            // Change color based on remaining time
            if (remaining <= this.warningTime) {
                countdownElement.style.color = '#ef4444';
                if (countdownElement.previousElementSibling) {
                    countdownElement.previousElementSibling.style.color = '#ef4444';
                }
            } else if (remaining <= 10 * 60 * 1000) { // 10 minutes
                countdownElement.style.color = '#f59e0b';
                if (countdownElement.previousElementSibling) {
                    countdownElement.previousElementSibling.style.color = '#f59e0b';
                }
            }

            // Auto expiration
            if (remaining <= 0) {
                this.handleSessionExpiry();
            }
        }
    }

    startSessionTimer() {
        // Update countdown every second
        setInterval(() => {
            this.updateCountdown();
        }, 1000);

        // Check session status periodically
        setInterval(() => {
            this.checkSessionStatus();
        }, this.checkInterval);
    }

    async checkSessionStatus() {
        try {
            const response = await fetch('/api/dashboard/', {
                method: 'HEAD',
                credentials: 'same-origin'
            });

            if (response.status === 401 || response.status === 403) {
                this.handleSessionExpiry();
            }
        } catch (error) {
            console.warn('Session verification error:', error);
        }
    }

    handleSessionExpiry() {
        // Show expiration notification
        if (typeof notificationSystem !== 'undefined') {
            notificationSystem.addNotification(
                'warning',
                'Session expirée',
                'Votre session a expiré. Vous allez être redirigé vers la page de connexion.',
                null
            );
        }

        // Redirect after delay
        setTimeout(() => {
            window.location.href = '/api/login/';
        }, 3000);
    }

    setupEventListeners() {
        // User activity to extend session
        let activityTimeout;
        const resetActivityTimeout = () => {
            clearTimeout(activityTimeout);
            activityTimeout = setTimeout(() => {
                this.extendSession();
            }, 30000); // Reset after 30 seconds of inactivity
        };

        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetActivityTimeout, true);
        });

        resetActivityTimeout(); // Initialize
    }

    extendSession() {
        // Could make an AJAX call to extend session server-side
        console.log('Session extended by user activity');
        // Uncomment to actually extend session:
        // fetch('/api/extend-session/', { method: 'POST', credentials: 'same-origin' });
    }
}

// Session panel control functions
function showSessionInfo() {
    const sessionInfo = document.getElementById('sessionInfo');
    if (sessionInfo) {
        sessionInfo.classList.remove('hidden');
    }
}

function hideSessionInfo() {
    const sessionInfo = document.getElementById('sessionInfo');
    if (sessionInfo) {
        sessionInfo.classList.add('hidden');
    }
}

// Initialize auth system when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthSystem);
} else {
    initAuthSystem();
}

function initAuthSystem() {
    // Initialize the professional authentication system
    const authSystem = new ProfessionalAuthSystem();

    // Hide session panel when clicking outside
    document.addEventListener('click', (e) => {
        const sessionInfo = document.getElementById('sessionInfo');
        const securityIndicator = document.querySelector('.security-indicator');

        if (sessionInfo && securityIndicator) {
            if (!sessionInfo.contains(e.target) && !securityIndicator.contains(e.target)) {
                hideSessionInfo();
            }
        }
    });

    // Make authSystem globally available if needed
    window.authSystem = authSystem;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ProfessionalAuthSystem, showSessionInfo, hideSessionInfo };
}
