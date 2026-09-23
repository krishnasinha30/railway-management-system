import { useEffect, useState } from 'react'
import api from '../api/axiosInstance'
import DashboardChart from '../components/dashboard/DashboardChart'
import { Portal } from './TrainSearchPage'

export default function AdminAnalyticsPage() {
  const [data, setData] = useState({})
  useEffect(() => { api.get('/dashboard/admin').then(response => setData(response.data.data)) }, [])
  const chartData = [{ label: 'Trains', value: data.totalTrains || 0 }, { label: 'Stations', value: data.activeStations || 0 }, { label: 'Employees', value: data.totalEmployees || 0 }, { label: 'Delayed', value: data.delayedTrains || 0 }, { label: 'Bookings', value: data.activeBookings || 0 }]
  return <Portal title="Analytics" eyebrow="Admin dashboard"><section className="rounded-3xl border border-ink/10 bg-white p-6"><h2 className="font-bold">Network overview</h2><p className="mt-1 text-sm text-slate-500">Live values from the admin dashboard API.</p><div className="mt-8"><DashboardChart data={chartData} /></div></section></Portal>
}
