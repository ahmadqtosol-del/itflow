import { config } from '../../config';

const EVENTS = [
  'ISSUE_CREATED',
  'ISSUE_UPDATED',
  'ISSUE_ASSIGNED',
  'MESSAGE_CREATED',
  'NOTIFICATION',
];

class WebSocketClient {
  constructor() {
    this.socket = null;

    this.listeners = new Map();
    this.statusListeners = new Set();

    this.status = 'OFFLINE';

    this.reconnectTimer = null;
    this.shouldReconnect = true;

    this.connecting = false;
  }

  connect() {
    /*
     * Prevent duplicate WebSocket connections.
     */
    if (
      this.socket &&
      (
        this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING
      )
    ) {
      return;
    }

    if (this.connecting) {
      return;
    }

    this.shouldReconnect = true;
    this.connecting = true;

    this._setStatus('RECONNECTING');

    try {
      const socket = new WebSocket(config.ws.url);

      this.socket = socket;

      socket.onopen = () => {
        /*
         * Make sure this is still the active socket.
         */
        if (this.socket !== socket) {
          socket.close();
          return;
        }

        this.connecting = false;

        this._setStatus('CONNECTED');

        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (!data || !data.event) {
            return;
          }

          this._emit(data.event, data.payload);
        } catch {
          /*
           * Ignore non-JSON websocket messages.
           */
          console.debug(
            'WS non-JSON payload:',
            event.data,
          );
        }
      };

      socket.onerror = (error) => {
        console.warn('WebSocket error:', error);
      };

      socket.onclose = () => {
        this.connecting = false;

        /*
         * Do not let an old socket change the state
         * of a newer socket.
         */
        if (this.socket === socket) {
          this.socket = null;
        }

        this._setStatus('OFFLINE');

        if (this.shouldReconnect) {
          this._scheduleReconnect();
        }
      };
    } catch (error) {
      this.connecting = false;

      console.warn(
        'WebSocket connection failed:',
        error,
      );

      this._setStatus('OFFLINE');

      if (this.shouldReconnect) {
        this._scheduleReconnect();
      }
    }
  }

  _scheduleReconnect() {
    /*
     * Never create multiple reconnect timers.
     */
    if (this.reconnectTimer) {
      return;
    }

    const delay =
      config.ws.reconnectIntervalMs || 3000;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;

      if (this.shouldReconnect) {
        this.connect();
      }
    }, delay);
  }

  disconnect() {
    this.shouldReconnect = false;
    this.connecting = false;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    const socket = this.socket;
    this.socket = null;

    if (socket) {
      /*
       * Prevent its onclose handler from scheduling
       * another reconnect.
       */
      socket.close();
    }

    this._setStatus('OFFLINE');
  }

  on(event, handler) {
    if (!event || typeof handler !== 'function') {
      return () => {};
    }

    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const handlers = this.listeners.get(event);

    handlers.add(handler);

    /*
     * Important:
     * calling the same handler twice does not create
     * duplicate registrations because Set is used.
     */
    return () => {
      handlers.delete(handler);

      if (handlers.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  onStatusChange(handler) {
    if (typeof handler !== 'function') {
      return () => {};
    }

    this.statusListeners.add(handler);

    /*
     * Immediately report current status.
     */
    handler(this.status);

    return () => {
      this.statusListeners.delete(handler);
    };
  }

  _emit(event, payload) {
    const handlers = this.listeners.get(event);

    if (!handlers || handlers.size === 0) {
      return;
    }

    /*
     * Snapshot prevents problems if a listener unsubscribes
     * itself while handling the event.
     */
    [...handlers].forEach((handler) => {
      try {
        handler(payload);
      } catch (error) {
        console.error(
          `WebSocket listener failed for "${event}":`,
          error,
        );
      }
    });
  }

  _setStatus(status) {
    if (this.status === status) {
      return;
    }

    this.status = status;

    [...this.statusListeners].forEach((handler) => {
      try {
        handler(status);
      } catch (error) {
        console.error(
          'WebSocket status listener failed:',
          error,
        );
      }
    });
  }
}

export const wsClient = new WebSocketClient();

export const WS_EVENTS = EVENTS;