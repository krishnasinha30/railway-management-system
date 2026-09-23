import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function DashboardChart({ data }) {
  return <div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="#eadfeb" /><XAxis dataKey="label" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="value" fill="#902DAA" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
}
