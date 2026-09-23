import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { login, register } from "../features/auth/authSlice";

export default function AuthPage({ mode = "login" }) {
  const isRegister = mode === "register";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const submit = async (event) => {
    event.preventDefault();
    const action = await dispatch(
      isRegister ? register(values) : login(values),
    );
    if (!action.error) {
      const role = action.payload.user.role;
      const redirectMap = {
        passenger: "/dashboard",
        employee: "/dashboard",
        admin: "/dashboard",
      };
      navigate(redirectMap[role] || "/dashboard");
    }
  };
  return (
    <div className="min-h-screen bg-mist p-6 text-ink">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-soft lg:grid-cols-2">
        <div className="relative hidden overflow-hidden bg-ink p-12 lg:flex lg:flex-col lg:justify-between">
          <div className="rail-lines absolute inset-0" />
          <Link to="/" className="relative flex items-center gap-3 text-white">
            <img src="/logo.svg" alt="Rail Center" className="h-12 w-12" />
            <span className="font-display text-2xl">Rail Center</span>
          </Link>
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-flare">
              Passenger information portal
            </p>
            <h1 className="mt-5 max-w-md font-display text-5xl leading-tight text-white">
              Move through the day with certainty.
            </h1>
            <p className="mt-6 max-w-sm leading-7 text-white/60">
              Your calm, connected view of trains, platforms, and station
              updates.
            </p>
          </div>
          <p className="relative text-xs text-white/35">
            Railway Management System · Academic simulation
          </p>
        </div>
        <div className="flex flex-col justify-center p-7 sm:p-14">
          <Link
            to="/"
            className="mb-12 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-ink"
          >
            <ArrowLeft size={16} /> Back to home
          </Link>
          <div className="mb-9 lg:hidden">
            <img src="/logo.svg" alt="Rail Center" className="h-12 w-12" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-flare">
            {isRegister ? "Create your account" : "Welcome back"}
          </p>
          <h2 className="mt-3 font-display text-4xl">
            {isRegister ? "Join Rail Center." : "Sign in to continue."}
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            {isRegister
              ? "Start with a passenger account for station updates and booking requests."
              : "Access your personalised railway information."}
          </p>
          <form onSubmit={submit} className="mt-8 grid gap-4">
            {isRegister && (
              <label className="relative">
                <UserRound
                  className="absolute left-4 top-3.5 text-slate-400"
                  size={18}
                />
                <input
                  required
                  placeholder="Full name"
                  value={values.name}
                  onChange={(e) =>
                    setValues({ ...values, name: e.target.value })
                  }
                  className="field pl-11"
                />
              </label>
            )}
            <label className="relative">
              <Mail
                className="absolute left-4 top-3.5 text-slate-400"
                size={18}
              />
              <input
                required
                type="email"
                placeholder="Email address"
                value={values.email}
                onChange={(e) =>
                  setValues({ ...values, email: e.target.value })
                }
                className="field pl-11"
              />
            </label>
            <label className="relative">
              <LockKeyhole
                className="absolute left-4 top-3.5 text-slate-400"
                size={18}
              />
              <input
                required
                minLength="6"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={values.password}
                onChange={(e) =>
                  setValues({ ...values, password: e.target.value })
                }
                className="field pl-11 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </label>
            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            )}
            <button
              disabled={loading}
              className="mt-2 rounded-2xl bg-ink px-5 py-3.5 text-sm font-bold text-white transition hover:bg-plum disabled:opacity-50"
            >
              {loading
                ? "Please wait..."
                : isRegister
                  ? "Create passenger account"
                  : "Sign in"}
            </button>
          </form>
          <p className="mt-7 text-center text-sm text-slate-500">
            {isRegister ? "Already registered?" : "New to Rail Center?"}{" "}
            <Link
              className="font-bold text-plum"
              to={isRegister ? "/login" : "/register"}
            >
              {isRegister ? "Sign in" : "Create account"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
