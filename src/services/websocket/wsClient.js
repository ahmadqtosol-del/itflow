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

    /*
     * Prevent multiple simultaneous connection attempts.
     */
    if (this.connecting) {
      return;
    }

    this.shouldReconnect = true;
    this.connecting = true;

    this._setStatus('RECONNECTING');

    try {
      const socket = new WebSocket(config.ws.url);

      /*
       * This socket becomes the active socket.
       */
      this.socket = socket;

      socket.onopen = () => {
        /*
         * Ignore a socket that has already been replaced
         * by another connection.
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
        /*
         * IMPORTANT:
         *
         * Ignore messages coming from an old/stale socket.
         *
         * If a reconnect creates Socket B while Socket A
         * is still alive, Socket A must not emit the same
         * message again.
         */
        if (this.socket !== socket) {
          return;
        }

        try {
          const data = JSON.parse(event.data);

          if (!data || !data.event) {
            return;
          }

          this._emit(data.event, data.payload);
        } catch {
          /*
           * Ignore non-JSON WebSocket messages.
           */
          console.debug(
            'WS non-JSON payload:',
            event.data,
          );
        }
      };

      socket.onerror = (error) => {
        /*
         * Only report errors for the currently active socket.
         */
        if (this.socket !== socket) {
          return;
        }

        console.warn(
          'WebSocket error:',
          error,
        );
      };

      socket.onclose = () => {
        /*
         * Ignore close events from stale sockets.
         */
        if (this.socket !== socket) {
          return;
        }

        this.connecting = false;
        this.socket = null;

        this._setStatus('OFFLINE');

        if (this.shouldReconnect) {
          this._scheduleReconnect();
        }
      };
    } catch (error) {
      this.connecting = false;

      /*
       * Only clear the active socket if this failed
       * connection is still the active one.
       */
      if (this.socket === socket) {
        this.socket = null;
      }

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
       * Because this.socket has already been set to null,
       * its onclose handler will recognize the socket as stale
       * and will not schedule another reconnect.
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

    /*
     * Set prevents the exact same handler from being
     * registered more than once.
     */
    handlers.add(handler);

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
     * Immediately report the current status.
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
     * Snapshot the handlers so listeners can safely
     * unsubscribe while handling an event.
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