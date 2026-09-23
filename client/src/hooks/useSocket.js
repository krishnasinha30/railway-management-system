import { useEffect } from 'react';
import { socket } from '../api/socket';

export default function useSocket({
  stationId,
  onTrainUpdated,
  onAnnouncementCreated,
  onBookingUpdated,
  onFoodOrderUpdated,
  onWalletUpdated,
} = {}) {
  useEffect(() => {
    // Socket.io keeps a single connection for all pages. We connect once,
    // register the listeners needed by this screen, and clean them up
    // explicitly to avoid duplicate event listeners during re-renders.
    if (!socket.connected) {
      socket.connect();
    }

    const listeners = [];
    const register = (eventName, handler) => {
      if (!handler) return;
      socket.on(eventName, handler);
      listeners.push([eventName, handler]);
    };

    if (stationId) socket.emit('joinStation', stationId);

    register('trainUpdated', onTrainUpdated);
    register('announcementCreated', onAnnouncementCreated);
    register('bookingUpdated', onBookingUpdated);
    register('foodOrderUpdated', onFoodOrderUpdated);
    register('walletUpdated', onWalletUpdated);

    return () => {
      if (stationId) socket.emit('leaveStation', stationId);

      listeners.forEach(([eventName, handler]) => {
        socket.off(eventName, handler);
      });

      // Do not disconnect the shared socket on every component unmount because
      // other parts of the app may still be listening to live updates.
      // Reconnecting on the next mount is cheaper and avoids losing active updates.
    };
  }, [stationId, onTrainUpdated, onAnnouncementCreated, onBookingUpdated, onFoodOrderUpdated, onWalletUpdated]);
}
