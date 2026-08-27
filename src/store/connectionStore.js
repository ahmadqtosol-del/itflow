import { create } from 'zustand';
import { wsClient } from '../services/websocket/wsClient';

export const useConnectionStore = create((set) => ({
  status: 'OFFLINE', // CONNECTED | RECONNECTING | OFFLINE
  setStatus: (status) => set({ status }),
}));

// Bind wsClient connection status updates directly to store
wsClient.onStatusChange((status) => {
  useConnectionStore.setState({ status });
});

// Auto-connect websocket
wsClient.connect();
