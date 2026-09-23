import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AccessDeniedPage({ requiredRoles = [], currentRole = 'guest' }) {
  const names = requiredRoles.length ? requiredRoles.join(' / ') : 'authorized users'

  return (
    <div className="grid min-h-screen place-items-center bg-mist px-6 py-12 text-ink">
      <div className="w-full max-w-xl rounded-[2rem] border border-red-200 bg-white p-8 text-center shadow-soft">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-red-100 text-red-600">
          <ShieldAlert size={28} />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-red-500">Access denied</p>
        <h1 className="mt-4 font-display text-4xl text-ink">You do not have permission to view this page.</h1>
        <p className="mt-4 text-base text-slate-600">
          This area is restricted to <span className="font-bold text-plum">{names}</span> roles.
          Your current role is <span className="font-bold capitalize text-plum">{currentRole || 'guest'}</span>.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/dashboard"
            className="rounded-full bg-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-plum"
          >
            Go to dashboard
          </Link>
          <Link
            to="/"
            className="rounded-full border border-ink/15 px-5 py-3 text-sm font-bold text-ink transition hover:bg-slate-100"
          >
            <ArrowLeft className="mr-2 inline" size={16} /> Return home
          </Link>
        </div>
      </div>
    </div>
  )
}
