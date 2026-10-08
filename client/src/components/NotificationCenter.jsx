import { useCallback, useEffect, useState } from 'react'
import { Bell, Check, CheckCheck } from 'lucide-react'
import api from '../api/axiosInstance'
import useSocket from '../hooks/useSocket'

export default function NotificationCenter({ isAuthenticated, authToken, light = false }) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [liveNotice, setLiveNotice] = useState(null)

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([])
      setUnreadCount(0)
      return
    }
    try {
      const { data } = await api.get('/notifications/mine')
      setNotifications(data.data.notifications || [])
      setUnreadCount(data.data.unreadCount || 0)
    } catch (error) {
      console.error('Unable to load notifications:', error.response?.data?.message || error.message)
    }
  }, [isAuthenticated])

  const receiveNotification = useCallback(notification => {
    setNotifications(current => [notification, ...current.filter(item => item._id !== notification._id)].slice(0, 50))
    setUnreadCount(count => count + 1)
    setLiveNotice(notification)
  }, [])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  useEffect(() => {
    if (!liveNotice) return undefined
    const timeout = window.setTimeout(() => setLiveNotice(null), 5000)
    return () => window.clearTimeout(timeout)
  }, [liveNotice])

  useSocket({
    authToken,
    onNotification: isAuthenticated ? receiveNotification : undefined
  })

  const markRead = async notification => {
    if (notification.readAt) return
    try {
      const { data } = await api.put(`/notifications/${notification._id}/read`)
      setNotifications(current => current.map(item => item._id === notification._id ? data.data : item))
      setUnreadCount(count => Math.max(0, count - 1))
    } catch (error) {
      console.error('Unable to mark notification as read:', error.response?.data?.message || error.message)
    }
  }

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications(current => current.map(item => ({ ...item, readAt: item.readAt || new Date().toISOString() })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Unable to mark notifications as read:', error.response?.data?.message || error.message)
    }
  }

  if (!isAuthenticated) return null

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        onClick={() => setOpen(current => !current)}
        className={`relative grid h-10 w-10 place-items-center rounded-full border transition ${light ? 'border-white/25 text-white hover:bg-white/10' : 'border-plum/15 text-plum hover:bg-lavender-50'}`}
      >
        <Bell size={18} />
        {unreadCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </button>
      {open && (
        <section className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-ink/10 bg-white text-ink shadow-2xl">
          <header className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
            <h2 className="font-bold">Notifications</h2>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllRead} className="inline-flex items-center gap-1 text-xs font-semibold text-plum hover:underline">
                <CheckCheck size={14} />Mark all read
              </button>
            )}
          </header>
          <div className="max-h-96 overflow-y-auto">
            {notifications.map(notification => (
              <button
                type="button"
                key={notification._id}
                onClick={() => markRead(notification)}
                className={`block w-full border-b border-ink/5 px-4 py-3 text-left transition hover:bg-lavender-50 ${notification.readAt ? 'bg-white' : 'bg-indigo-50/70'}`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="text-sm font-bold">{notification.title}</span>
                  {notification.readAt && <Check size={14} className="mt-0.5 shrink-0 text-emerald-600" />}
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-600">{notification.message}</span>
                <span className="mt-1 block text-[10px] text-slate-400">{new Date(notification.createdAt).toLocaleString()}</span>
              </button>
            ))}
            {!notifications.length && <p className="px-4 py-8 text-center text-sm text-slate-500">You are all caught up.</p>}
          </div>
        </section>
      )}
      {liveNotice && (
        <div role="status" className="fixed bottom-5 right-5 z-[60] w-[min(24rem,calc(100vw-2.5rem))] rounded-2xl border border-ink/10 bg-white p-4 text-ink shadow-2xl">
          <p className="text-sm font-bold">{liveNotice.title}</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">{liveNotice.message}</p>
        </div>
      )}
    </div>
  )
}
