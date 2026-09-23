import { useEffect, useState } from 'react'
import { Building2, ClipboardList, Megaphone, Plus, Trash2, Users } from 'lucide-react'
import api from '../api/axiosInstance'
import { Portal } from './TrainSearchPage'

const tabs = [['stations', 'Stations', Building2], ['employees', 'Employees', Users], ['announcements', 'Announcements', Megaphone], ['bookings', 'Bookings', ClipboardList]]

export default function AdminManagementPage() {
  const [tab, setTab] = useState('stations')
  const [data, setData] = useState({ stations: [], employees: [], announcements: [], bookings: [] })
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ name: '', stationCode: '', city: '', totalPlatforms: 4 })

  const load = async () => {
    const [stations, employees, announcements, bookings] = await Promise.all([
      api.get('/stations'),
      api.get('/auth/employees'),
      api.get('/announcements'),
      api.get('/bookings')
    ])
    setData({
      stations: Array.isArray(stations?.data?.data) ? stations.data.data : [],
      employees: Array.isArray(employees?.data?.data) ? employees.data.data : [],
      announcements: Array.isArray(announcements?.data?.data) ? announcements.data.data : [],
      bookings: Array.isArray(bookings?.data?.data) ? bookings.data.data : []
    })
  }

  useEffect(() => { load().catch(() => setMessage('Unable to load management data.')) }, [])

  const createStation = async event => {
    event.preventDefault()
    try {
      await api.post('/stations', { ...form, totalPlatforms: Number(form.totalPlatforms), platforms: Array.from({ length: Number(form.totalPlatforms) }, (_, index) => String(index + 1)) })
      setMessage('Station created.')
      setForm({ name: '', stationCode: '', city: '', totalPlatforms: 4 })
      load()
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to create station.')
    }
  }

  const removeStation = async id => {
    await api.delete(`/stations/${id}`)
    setData(current => ({ ...current, stations: (current.stations || []).filter(item => item._id !== id) }))
  }

  const updateEmployee = async (employee, assignedStation) => {
    await api.put(`/auth/employees/${employee._id}`, { name: employee.name, assignedStation })
    setMessage('Employee assignment saved.')
    load()
  }

  const updateBooking = async (booking, bookingStatus) => {
    await api.put(`/bookings/${booking._id}`, { bookingStatus })
    setMessage('Booking status updated.')
    load()
  }

  const safeStations = Array.isArray(data.stations) ? data.stations : []
  const safeEmployees = Array.isArray(data.employees) ? data.employees : []
  const safeAnnouncements = Array.isArray(data.announcements) ? data.announcements : []
  const safeBookings = Array.isArray(data.bookings) ? data.bookings : []

  return (
    <Portal title="Admin management" eyebrow="Network administration">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key)} className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold ${tab === key ? 'bg-ink text-white' : 'bg-white text-slate-500'}`}>
            <Icon size={16} />{label}
          </button>
        ))}
      </div>
      {message && <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
      <section className="mt-6 rounded-3xl border border-ink/10 bg-white p-6">
        {tab === 'stations' && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold">Manage stations</h2>
                <p className="mt-1 text-sm text-slate-500">Create and remove network stations.</p>
              </div>
              <Plus className="text-plum" size={20} />
            </div>
            <form onSubmit={createStation} className="mt-6 grid gap-3 md:grid-cols-4">
              <input required className="field" placeholder="Station name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input required className="field" placeholder="Code e.g. NDLS" value={form.stationCode} onChange={e => setForm({ ...form, stationCode: e.target.value })} />
              <input required className="field" placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
              <button className="rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white">Add station</button>
            </form>
            <div className="mt-8 divide-y divide-ink/10">
              {safeStations.map(station => (
                <div key={station._id} className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-bold">{station.name} <span className="ml-2 text-xs text-plum">{station.stationCode}</span></p>
                    <p className="text-sm text-slate-500">{station.city} · {station.totalPlatforms} platforms</p>
                  </div>
                  <button onClick={() => removeStation(station._id)} aria-label={`Delete ${station.name}`} className="text-red-500"><Trash2 size={17} /></button>
                </div>
              ))}
            </div>
          </>
        )}
        {tab === 'employees' && (
          <>
            <h2 className="font-bold">Assign employees</h2>
            <div className="mt-6 divide-y divide-ink/10">
              {safeEmployees.map(employee => (
                <div key={employee._id} className="grid gap-3 py-4 md:grid-cols-[1fr_1fr_1fr] md:items-center">
                  <div>
                    <p className="font-bold">{employee.name}</p>
                    <p className="text-sm text-slate-500">{employee.email}</p>
                  </div>
                  <p className="text-sm text-slate-500">{employee.assignedStation?.stationCode || 'Unassigned'}</p>
                  <select defaultValue={employee.assignedStation?._id || ''} onChange={event => updateEmployee(employee, event.target.value)} className="field py-2">
                    <option value="">Unassigned</option>
                    {safeStations.map(station => (
                      <option key={station._id} value={station._id}>{station.stationCode} · {station.name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </>
        )}
        {tab === 'announcements' && (
          <>
            <h2 className="font-bold">Recent announcements</h2>
            <div className="mt-6 divide-y divide-ink/10">
              {safeAnnouncements.map(item => (
                <div key={item._id} className="py-4">
                  <div className="flex justify-between gap-3">
                    <p className="font-bold">{item.title}</p>
                    <span className="text-xs font-bold uppercase text-flare">{item.priority}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{item.message}</p>
                </div>
              ))}
            </div>
          </>
        )}
        {tab === 'bookings' && (
          <>
            <h2 className="font-bold">Booking requests</h2>
            <div className="mt-6 divide-y divide-ink/10">
              {safeBookings.map(booking => (
                <div key={booking._id} className="grid gap-3 py-4 md:grid-cols-[1fr_1fr_auto] md:items-center">
                  <div>
                    <p className="font-bold">{booking.bookingReference}</p>
                    <p className="text-sm text-slate-500">{booking.passenger?.name} · {booking.train?.trainName}</p>
                  </div>
                  <p className="text-sm text-slate-500">{booking.passengerCount} passenger(s)</p>
                  <select value={booking.bookingStatus} onChange={event => updateBooking(booking, event.target.value)} className="field py-2">
                    <option>Requested</option>
                    <option>Confirmed</option>
                    <option>Cancelled</option>
                  </select>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </Portal>
  )
}
