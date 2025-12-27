import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

/**
 * Socket.IO Hook
 * Manages WebSocket connections for real-time features
 */

// In production, when served from same origin, use current origin
// In development or when VITE_SOCKET_URL/VITE_API_URL is set, use that URL
const getSocketURL = () => {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.PROD && typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:5000';
};

const SOCKET_URL = getSocketURL();

// Singleton socket instance
let socketInstance = null;

export const useSocket = (namespace = '') => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Create or reuse socket connection
    if (!socketInstance) {
      socketInstance = io(SOCKET_URL + namespace, {
        transports: ['polling', 'websocket'], // Use polling first (Heroku free tier limitation)
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        auth: {
          token: localStorage.getItem('token')
        }
      });
    }

    socketRef.current = socketInstance;

    // Connection handlers
    const onConnect = () => {
      setIsConnected(true);
      setError(null);
    };

    const onDisconnect = (reason) => {
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        socketRef.current?.connect();
      }
    };

    const onError = (err) => {
      setError(err);
    };

    socketRef.current.on('connect', onConnect);
    socketRef.current.on('disconnect', onDisconnect);
    socketRef.current.on('connect_error', onError);

    // Set initial connection state
    setIsConnected(socketRef.current.connected);

    return () => {
      socketRef.current?.off('connect', onConnect);
      socketRef.current?.off('disconnect', onDisconnect);
      socketRef.current?.off('connect_error', onError);
    };
  }, [namespace]);

  // Emit event
  const emit = useCallback((event, data, callback) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data, callback);
    }
  }, []);

  // Listen to event
  const on = useCallback((event, handler) => {
    socketRef.current?.on(event, handler);
    return () => socketRef.current?.off(event, handler);
  }, []);

  // Remove listener
  const off = useCallback((event, handler) => {
    socketRef.current?.off(event, handler);
  }, []);

  // Join room
  const joinRoom = useCallback((room) => {
    emit('join_room', room);
  }, [emit]);

  // Leave room
  const leaveRoom = useCallback((room) => {
    emit('leave_room', room);
  }, [emit]);

  return {
    socket: socketRef.current,
    isConnected,
    error,
    emit,
    on,
    off,
    joinRoom,
    leaveRoom
  };
};

export default useSocket;
