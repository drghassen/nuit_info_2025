/**
 * Client WebSocket unifié pour les mises à jour en temps réel
 */
class WebSocketClient {
    constructor(url, callbacks = {}) {
        this.url = url;
        this.callbacks = callbacks;
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.isConnecting = false;
    }

    connect() {
        if (this.isConnecting || (this.socket && this.socket.readyState === WebSocket.OPEN)) {
            return;
        }

        this.isConnecting = true;
        
        try {
            // Construire l'URL WebSocket
            const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${wsProtocol}//${window.location.host}${this.url}`;
            
            this.socket = new WebSocket(wsUrl);

            this.socket.onopen = () => {
                console.log('WebSocket connecté:', this.url);
                this.isConnecting = false;
                this.reconnectAttempts = 0;
                if (this.callbacks.onOpen) {
                    this.callbacks.onOpen();
                }
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (this.callbacks.onMessage) {
                        this.callbacks.onMessage(data);
                    }
                } catch (error) {
                    console.error('Erreur lors du parsing des données WebSocket:', error);
                }
            };

            this.socket.onerror = (error) => {
                console.error('Erreur WebSocket:', error);
                this.isConnecting = false;
                if (this.callbacks.onError) {
                    this.callbacks.onError(error);
                }
            };

            this.socket.onclose = () => {
                console.log('WebSocket fermé:', this.url);
                this.isConnecting = false;
                this.socket = null;
                
                if (this.callbacks.onClose) {
                    this.callbacks.onClose();
                }

                // Tentative de reconnexion
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    console.log(`Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);
                    setTimeout(() => this.connect(), this.reconnectDelay);
                } else {
                    console.error('Impossible de se reconnecter au WebSocket');
                }
            };
        } catch (error) {
            console.error('Erreur lors de la connexion WebSocket:', error);
            this.isConnecting = false;
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.reconnectAttempts = this.maxReconnectAttempts; // Empêcher la reconnexion
    }

    send(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        } else {
            console.warn('WebSocket n\'est pas connecté');
        }
    }

    isConnected() {
        return this.socket && this.socket.readyState === WebSocket.OPEN;
    }
}

