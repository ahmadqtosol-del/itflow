// Centralized app configuration.
// Real values will come from environment variables once the FastAPI
// backend and WebSocket server exist (Chunk 2+). Nothing in the UI
// should reference these values directly — always go through services/.
export const config = {
  appName: 'ITFlow',
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
    timeout: 15000,
  },
  ws: {
    url: import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws',
    reconnectIntervalMs: 3000,
  },
  slaMinutes: {
    CRITICAL: 30,
    HIGH: 120,
    MEDIUM: 480,
    LOW: 1440,
  },
};
