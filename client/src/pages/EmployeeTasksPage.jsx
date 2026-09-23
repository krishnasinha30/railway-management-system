import { useEffect, useState } from 'react'
import { CheckCircle2, ClipboardList } from 'lucide-react'
import api from '../api/axiosInstance'
import { Portal } from './TrainSearchPage'

export default function EmployeeTasksPage() {
  const [tasks, setTasks] = useState([])
  const [message, setMessage] = useState('')
  const load = () => api.get('/tasks/my-tasks').then(response => setTasks(response.data.data)).catch(() => setMessage('Unable to load assigned tasks.'))
  useEffect(load, [])
  const update = async (task, status) => { try { await api.put(`/tasks/${task._id}`, { status }); setTasks(current => current.map(item => item._id === task._id ? { ...item, status } : item)); setMessage('Task status updated.') } catch (error) { setMessage(error.response?.data?.message || 'Unable to update task.') } }
  return <Portal title="Assigned tasks" eyebrow="Employee workspace"><div className="rounded-3xl border border-ink/10 bg-white p-6"><div className="flex items-center gap-3"><ClipboardList className="text-plum" /><div><h2 className="font-bold">Daily operations</h2><p className="mt-1 text-sm text-slate-500">Keep assigned station work moving.</p></div></div>{message && <p className="mt-5 text-sm text-emerald-700">{message}</p>}<div className="mt-6 divide-y divide-ink/10">{tasks.map(task => <div key={task._id} className="grid gap-4 py-5 md:grid-cols-[1fr_1fr_auto] md:items-center"><div><p className="font-bold">{task.title}</p><p className="mt-1 text-sm leading-6 text-slate-500">{task.description}</p></div><p className="text-sm text-slate-400">Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</p><select value={task.status} onChange={event => update(task, event.target.value)} className="field py-2"><option>Pending</option><option>In Progress</option><option>Completed</option></select></div>)}{!tasks.length && <div className="py-10 text-center text-sm text-slate-500"><CheckCircle2 className="mx-auto mb-3 text-emerald-600" />No assigned tasks.</div>}</div></div></Portal>
}
