import { io } from 'socket.io-client'

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '').replace(/\/+$/, '')
  }
  return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000'
}

export const socket = io(getSocketUrl(), { autoConnect: false })
