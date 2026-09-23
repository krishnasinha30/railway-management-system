import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Compass,
  ConciergeBell,
  Facebook,
  Heart,
  Instagram,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
  TrainFront,
  Utensils,
  WalletCards,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import api from "./api/axiosInstance";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import TrainSearchPage from "./pages/TrainSearchPage";
import StationBoardPage from "./pages/StationBoardPage";
import TrainDetailsPage from "./pages/TrainDetailsPage";
import OperationsPage from "./pages/OperationsPage";
import AdminManagementPage from "./pages/AdminManagementPage";
import EmployeeTasksPage from "./pages/EmployeeTasksPage";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import BookingsPage from "./pages/BookingsPage";
import WalletPage from "./pages/WalletPage";
import PnrPage from "./pages/PnrPage";
import FoodPage from "./pages/FoodPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import ProfilePage from "./pages/ProfilePage";
import BookingConfirmationPage from "./pages/BookingConfirmationPage";
import useAuth from "./hooks/useAuth";

const quickActions = [
  { icon: Search, label: "Search trains", href: "/trains" },
  { icon: Ticket, label: "Book a ticket", href: "/trains" },
  { icon: Compass, label: "Check PNR", href: "/pnr" },
  { icon: Utensils, label: "Order food", href: "/food" },
  { icon: TrainFront, label: "Live status", href: "/station-board" },
  { icon: ConciergeBell, label: "Station board", href: "/station-board" },
];
const journeyImages = [
  "/images/railway-journey.avif",
  "/images/railway-network.webp",
  "/images/network-insights.webp",
];

function Logo({ light = false }) {
  return (
    <Link
      to="/"
      className={`flex items-center gap-3 ${light ? "text-white" : "text-ink"}`}
    >
      <img
        src="/logo.svg"
        alt="RC Rail Center logo"
        className="h-11 w-11 object-contain"
      />
      <span>
        <span className="block font-display text-xl tracking-tight">
          RC Rail Center
        </span>
        <span
          className={`mt-1 block text-[9px] font-bold uppercase tracking-[0.24em] ${light ? "text-white/55" : "text-plum/60"}`}
        >
          Journey intelligence
        </span>
      </span>
    </Link>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const links = [
    ["Home", "/"],
    ["Find trains", "/trains"],
    ["My bookings", "/bookings"],
    ["PNR status", "/pnr"],
    ["Order food", "/food"],
    ["Station board", "/station-board"],
  ];
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${scrolled ? "border-b border-purple-900/30 bg-plum-950/95 shadow-lg backdrop-blur-xl" : "bg-transparent"}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-10">
        <Logo light />
        <nav className="hidden items-center gap-6 text-[13px] font-semibold text-white/75 xl:flex">
          {links.map(([label, href]) => (
            <Link className="transition hover:text-white" key={href} to={href}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <Link
                to="/wallet"
                className="rounded-full border border-white/25 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white hover:text-ink"
              >
                <WalletCards className="mr-2 inline" size={16} />
                Wallet
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-bold text-white transition hover:bg-white/20"
              >
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt=""
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-lilac text-ink">
                    {user?.name?.[0] || "P"}
                  </span>
                )}
                {user?.name?.split(" ")[0] || "Profile"}
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full border border-white/25 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white hover:text-ink"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-lilac px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-white"
              >
                Register
              </Link>
            </>
          )}
        </div>
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
          className="rounded-full border border-white/25 p-2 text-white md:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <nav className="mx-4 mb-4 rounded-3xl border border-white/15 bg-plum-950/95 p-5 text-sm text-white shadow-2xl backdrop-blur-xl">
          <div className="grid gap-4">
            {links.map(([label, href]) => (
              <Link onClick={() => setOpen(false)} key={href} to={href}>
                {label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link onClick={() => setOpen(false)} to="/wallet">
                  Wallet
                </Link>
                <Link onClick={() => setOpen(false)} to="/profile">
                  Profile
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="mt-2 rounded-full bg-white px-4 py-3 text-center font-bold text-ink"
              >
                Login / Register
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

function SearchPanel({ stations }) {
  const safeStations = Array.isArray(stations) ? stations : [];
  const navigate = useNavigate();
  const [form, setForm] = useState({
    from: "",
    to: "",
    date: new Date().toISOString().slice(0, 10),
    classCode: "CC",
    passengers: "1",
  });
  const [error, setError] = useState("");
  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = (event) => {
    event.preventDefault();
    if (!form.from || !form.to || form.from === form.to)
      return setError("Choose two different stations to search.");
    setError("");
    navigate(
      `/trains?source=${form.from}&destination=${form.to}&journeyDate=${form.date}&travelClass=${form.classCode}&passengers=${form.passengers}`,
    );
  };
  return (
    <div className="relative mx-auto -mt-20 max-w-6xl px-5 lg:px-10">
      <div className="rounded-[2rem] border border-white/60 bg-white/95 p-5 shadow-[0_24px_80px_rgba(28,8,37,.2)] backdrop-blur-xl sm:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Plan your next journey</p>
            <h2 className="mt-1 font-display text-2xl text-ink sm:text-3xl">
              Find a train that takes you further.
            </h2>
          </div>
          <span className="hidden items-center gap-2 rounded-full bg-lavender-50 px-3 py-2 text-xs font-bold text-plum sm:flex">
            <ShieldCheck size={14} /> Academic simulation
          </span>
        </div>
        <form
          onSubmit={submit}
          className="grid gap-3 lg:grid-cols-[1.15fr_1.15fr_1fr_.72fr_.55fr_auto] lg:items-end"
        >
          <label className="relative">
            <span className="field-label">From station</span>
            <MapPin className="field-icon" size={17} />
            <select
              value={form.from}
              onChange={(event) => update("from", event.target.value)}
              className="field pl-10"
            >
              <option value="">Select origin</option>
              {safeStations.map((station) => (
                <option value={station._id} key={station._id}>
                  {station.name} ({station.stationCode}) · {station.city}
                </option>
              ))}
            </select>
          </label>
          <label className="relative">
            <span className="field-label">To station</span>
            <MapPin className="field-icon" size={17} />
            <select
              value={form.to}
              onChange={(event) => update("to", event.target.value)}
              className="field pl-10"
            >
              <option value="">Select destination</option>
              {safeStations.map((station) => (
                <option value={station._id} key={station._id}>
                  {station.name} ({station.stationCode}) · {station.city}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="field-label">Journey date</span>
            <span className="relative block">
              <CalendarDays className="field-icon" size={17} />
              <input
                type="date"
                value={form.date}
                onChange={(event) => update("date", event.target.value)}
                className="field pl-10"
              />
            </span>
          </label>
          <label>
            <span className="field-label">Class</span>
            <select
              value={form.classCode}
              onChange={(event) => update("classCode", event.target.value)}
              className="field"
            >
              <option>CC</option>
              <option>SL</option>
              <option>3A</option>
              <option>2A</option>
              <option>1A</option>
            </select>
          </label>
          <label>
            <span className="field-label">Passengers</span>
            <select
              value={form.passengers}
              onChange={(event) => update("passengers", event.target.value)}
              className="field"
            >
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
              <option>5</option>
            </select>
          </label>
          <button className="flex min-h-[50px] items-center justify-center gap-2 rounded-2xl bg-plum-950 px-5 text-sm font-bold text-white transition hover:bg-purple-700">
            <Search size={17} />
            Search
          </button>
        </form>
        {error && (
          <p className="mt-3 text-sm font-semibold text-danger">{error}</p>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
          <span className="mr-2 font-bold text-ink">Recent searches</span>
          <button
            type="button"
            onClick={() => {
              update("from", stations[0]?._id || "");
              update("to", stations[5]?._id || "");
            }}
            className="rounded-full bg-lavender-50 px-3 py-2 transition hover:bg-purple-100"
          >
            NDLS → LKO
          </button>
          <button
            type="button"
            onClick={() => {
              update("from", stations[1]?._id || "");
              update("to", stations[0]?._id || "");
            }}
            className="rounded-full bg-lavender-50 px-3 py-2 transition hover:bg-purple-100"
          >
            MMCT → NDLS
          </button>
        </div>
      </div>
    </div>
  );
}

function HomePage() {
  const [stations, setStations] = useState([]);
  const [trains, setTrains] = useState([]);
  const [overview, setOverview] = useState({});
  useEffect(() => {
    Promise.all([
      api.get("/stations"),
      api.get("/trains"),
      api.get("/dashboard/overview"),
    ])
      .then(([stationResponse, trainResponse, overviewResponse]) => {
        setStations(Array.isArray(stationResponse?.data?.data) ? stationResponse.data.data : []);
        setTrains(Array.isArray(trainResponse?.data?.data) ? trainResponse.data.data : []);
        setOverview(overviewResponse?.data?.data || {});
      })
      .catch(() => {});
  }, []);
  const categories = [
    "Vande Bharat",
    "Rajdhani",
    "Shatabdi",
    "Duronto",
    "Tejas",
    "Express",
  ];
  const safeOverview = overview || {};
  const stats = [
    ["Trains managed", safeOverview.trains ?? 0, TrainFront],
    ["Stations connected", safeOverview.stations ?? 0, MapPin],
    ["Registered passengers", safeOverview.passengers ?? 0, ShieldCheck],
    ["Active bookings", safeOverview.activeBookings ?? 0, Ticket],
    ["Food delivered", safeOverview.deliveredFood ?? 0, Utensils],
  ];
  return (
    <div className="min-h-screen bg-lavender-50 text-ink">
      <section className="hero-journey relative min-h-[720px] overflow-hidden">
        <div className="hero-vignette" />
        <Navbar />
        <div className="relative mx-auto flex max-w-7xl flex-col px-5 pb-28 pt-40 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-plum-950/35 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white/80 backdrop-blur">
              <Sparkles size={14} className="text-lilac" /> Smart railway travel
              platform
            </div>
            <h1 className="font-display text-5xl leading-[.98] text-white sm:text-7xl lg:text-[5.7rem]">
              Your journey,
              <br />
              <em className="text-lilac">planned better.</em>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-white/75 sm:text-lg">
              Discover beautiful routes, book simulated tickets, follow your
              PNR, and bring a warm meal to your seat.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#search"
                className="inline-flex items-center gap-3 rounded-full bg-lilac px-6 py-3.5 text-sm font-bold text-ink transition hover:bg-white"
              >
                Find trains <ArrowRight size={17} />
              </a>
              <Link
                to="/pnr"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                <Compass size={17} /> Track PNR
              </Link>
            </div>
          </motion.div>
          <div className="mt-16 hidden items-center gap-5 text-white/70 lg:flex">
            <div className="h-px w-24 bg-white/30" />
            <p className="text-xs font-bold uppercase tracking-[0.24em]">
              Journeys across India · Simulated in real time
            </p>
          </div>
        </div>
      </section>
      <div id="search">
        <SearchPanel stations={stations} />
      </div>
      <main>
        <section className="mx-auto max-w-7xl px-5 py-12 lg:px-10">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {quickActions.map(({ icon: Icon, label, href }, index) => (
              <Link
                key={label}
                to={href}
                className={`group flex min-h-[112px] flex-col justify-between rounded-3xl p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${index === 0 ? "bg-plum-900 text-white" : "bg-white text-ink"}`}
              >
                <Icon
                  size={21}
                  className={index === 0 ? "text-lilac" : "text-plum"}
                />
                <span className="text-sm font-bold">{label}</span>
                <ArrowRight
                  size={16}
                  className={`transition group-hover:translate-x-1 ${index === 0 ? "text-white/60" : "text-plum"}`}
                />
              </Link>
            ))}
          </div>
        </section>
        <section className="border-y border-plum/10 bg-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[.8fr_1.2fr] lg:px-10">
            <div>
              <p className="eyebrow">Explore rail journeys</p>
              <h2 className="section-title">A better view of the country.</h2>
              <p className="mt-5 max-w-md text-base leading-7 text-text-secondary">
                From sunrise departures to misty mountain bends, choose your
                route with the information you need and the feeling you want.
              </p>
              <Link
                to="/trains"
                className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-plum hover:text-purple-700"
              >
                Explore all trains <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {categories.map((category, index) => {
                const count = (Array.isArray(trains) ? trains : []).filter(
                  (train) => train?.category === category,
                ).length;
                return (
                  <motion.div
                    whileHover={{ y: -6 }}
                    key={category}
                    className="group relative min-h-[210px] overflow-hidden rounded-[1.6rem] bg-plum-950"
                  >
                    <img
                      src={journeyImages[index % journeyImages.length]}
                      loading="lazy"
                      alt={`${category} train journey`}
                      className="absolute inset-0 h-full w-full object-cover opacity-65 transition duration-500 group-hover:scale-105 group-hover:opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-plum-950 via-plum-950/20 to-transparent" />
                    <div className="relative flex h-full min-h-[210px] flex-col justify-end p-5 text-white">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-lilac">
                        {count} {count === 1 ? "train" : "trains"}
                      </p>
                      <h3 className="mt-2 font-display text-2xl">{category}</h3>
                      <Link
                        to={`/trains?category=${encodeURIComponent(category)}`}
                        className="mt-3 flex items-center gap-2 text-xs font-bold text-white/75"
                      >
                        Explore <ArrowRight size={14} />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-10">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="eyebrow">Network at a glance</p>
              <h2 className="section-title">The system behind your journey.</h2>
            </div>
            <span className="rounded-full border border-plum/15 bg-white px-4 py-2 text-xs font-bold text-text-secondary">
              <Clock3 className="mr-2 inline text-plum" size={14} /> Updated
              from live records
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {stats.map(([label, value, Icon]) => (
              <div
                key={label}
                className="rounded-3xl border border-plum/10 bg-white p-6 shadow-sm"
              >
                <Icon size={20} className="text-plum" />
                <p className="mt-8 font-display text-4xl text-ink">
                  {value ?? "—"}
                </p>
                <p className="mt-2 text-sm font-semibold text-text-secondary">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>
        <section className="relative overflow-hidden bg-plum-950">
          <div className="absolute inset-0 opacity-25">
            <img
              src="/images/railway-network.webp"
              alt="Indian railway network landscape"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[1fr_1.3fr] lg:px-10">
            <div className="text-white">
              <p className="eyebrow text-lilac">Why RC Rail Center</p>
              <h2 className="section-title text-white">
                Made for the whole journey.
              </h2>
              <p className="mt-5 max-w-md leading-7 text-white/65">
                One original, calm control room for passengers, station
                employees, and the people keeping every platform moving.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                [
                  Search,
                  "Easy train discovery",
                  "Search by station, class, date, or train.",
                ],
                [
                  Ticket,
                  "Mock ticket booking",
                  "A guided flow with fare and seat visibility.",
                ],
                [
                  TrainFront,
                  "Live platform updates",
                  "Simulated operations updates through Socket.io.",
                ],
                [
                  Utensils,
                  "Food at your seat",
                  "Station-based menus for active journeys.",
                ],
                [
                  WalletCards,
                  "Secure simulation wallet",
                  "Transparent mock credits, debits, and refunds.",
                ],
                [
                  ShieldCheck,
                  "Station operations",
                  "Role-aware tools for every railway team.",
                ],
              ].map(([Icon, title, text]) => (
                <div
                  key={title}
                  className="rounded-3xl border border-white/10 bg-white/[.08] p-5 backdrop-blur-sm"
                >
                  <Icon size={20} className="text-lilac" />
                  <h3 className="mt-7 font-bold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-plum-950 px-5 py-12 text-white lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/50">
              Railway Management System for clearer journeys and calmer
              stations.
            </p>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-lilac">
              Academic simulation project
            </p>
          </div>
          <div>
            <p className="text-sm font-bold">Explore</p>
            <div className="mt-5 grid gap-3 text-sm text-white/55">
              <Link to="/trains">Find trains</Link>
              <Link to="/station-board">Station board</Link>
              <Link to="/pnr">PNR status</Link>
              <Link to="/food">Order food</Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold">Reality check</p>
            <p className="mt-5 text-sm leading-6 text-white/55">
              No real IRCTC, payment, GPS, or ticketing integration. All journey
              data is simulated for learning.
            </p>
            <div className="mt-5 flex gap-3 text-white/50">
              <Instagram size={17} />
              <Facebook size={17} />
              <Heart size={17} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-lavender-50 p-6 text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="mt-3 font-display text-5xl">That route is closed.</h1>
        <Link
          to="/"
          className="mt-6 inline-block rounded-full bg-plum-950 px-5 py-3 text-sm font-bold text-white"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/trains" element={<TrainSearchPage />} />
      <Route path="/trains/:id" element={<TrainDetailsPage />} />
      <Route path="/station-board" element={<StationBoardPage />} />
      <Route
        path="/bookings"
        element={
          <ProtectedRoute roles={["passenger"]}>
            <BookingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wallet"
        element={
          <ProtectedRoute roles={["passenger"]}>
            <WalletPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute roles={["passenger"]}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking-confirmation/:id"
        element={
          <ProtectedRoute roles={["passenger", "admin"]}>
            <BookingConfirmationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pnr"
        element={
          <ProtectedRoute roles={["passenger", "admin"]}>
            <PnrPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/food"
        element={
          <ProtectedRoute roles={["passenger"]}>
            <FoodPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/operations"
        element={
          <RoleRoute roles={["employee"]}>
            <OperationsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/manage-trains"
        element={
          <RoleRoute roles={["admin"]}>
            <OperationsPage admin />
          </RoleRoute>
        }
      />
      <Route
        path="/manage"
        element={
          <RoleRoute roles={["admin"]}>
            <AdminManagementPage />
          </RoleRoute>
        }
      />
      <Route
        path="/users"
        element={
          <RoleRoute roles={["admin"]}>
            <AdminUsersPage />
          </RoleRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <RoleRoute roles={["admin"]}>
            <AdminAnalyticsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <RoleRoute roles={["employee"]}>
            <EmployeeTasksPage />
          </RoleRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
