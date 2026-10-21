import { useEffect } from 'react';
import { socket } from '../api/socket';

export default function useSocket({
  stationId,
  onTrainUpdated,
  onAnnouncementCreated,
  onBookingUpdated,
  onFoodOrderUpdated,
  onWalletUpdated,
  onNotification,
  onConnected,
  authToken = localStorage.getItem('rms_token'),
} = {}) {
  useEffect(() => {
    const listeners = [];
    const register = (eventName, handler) => {
      if (!handler) return;
      socket.on(eventName, handler);
      listeners.push([eventName, handler]);
    };

    if (socket.authToken !== authToken) {
      socket.authToken = authToken
      socket.auth = authToken ? { token: authToken } : {}
      if (socket.connected || socket.active) socket.disconnect()
    }

    register('trainUpdated', onTrainUpdated);
    register('announcementCreated', onAnnouncementCreated);
    register('bookingUpdated', onBookingUpdated);
    register('foodOrderUpdated', onFoodOrderUpdated);
    register('walletUpdated', onWalletUpdated);
    register('notification', onNotification);
    register('connect', onConnected);
    register('connect_error', error => {
      console.error('Unable to connect to live updates:', error.message)
    });

    const joinStation = () => {
      if (stationId) socket.emit('joinStation', stationId);
    };
    if (stationId) {
      socket.on('connect', joinStation);
      listeners.push(['connect', joinStation]);
    }

    if (!socket.connected) {
      socket.connect();
    }
    if (socket.connected) joinStation();

    return () => {
      if (stationId) socket.emit('leaveStation', stationId);

      listeners.forEach(([eventName, handler]) => {
        socket.off(eventName, handler);
      });

      // Do not disconnect the shared socket on every component unmount because
      // other parts of the app may still be listening to live updates.
      // Reconnecting on the next mount is cheaper and avoids losing active updates.
    };
  }, [stationId, onTrainUpdated, onAnnouncementCreated, onBookingUpdated, onFoodOrderUpdated, onWalletUpdated, onNotification, onConnected, authToken]);
}
