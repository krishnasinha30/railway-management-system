import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  RefreshCw,
  ShieldCheck,
  TrainFront,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axiosInstance";
import useAuth from "../hooks/useAuth";
import useSocket from "../hooks/useSocket";
import { Portal } from "./TrainSearchPage";

const createCaptcha = () =>
  Math.random().toString(36).slice(2, 8).toUpperCase();
const formatDate = (date) => date.toISOString().slice(0, 10);

export default function TrainDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [train, setTrain] = useState(null);
  const [stations, setStations] = useState([]);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(null);
  const [captcha, setCaptcha] = useState(createCaptcha);
  const today = new Date();
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 2);
  const [form, setForm] = useState({
    journeyDate: formatDate(new Date(today.getTime() + 86400000)),
    boardingStation: "",
    destinationStation: "",
    travelClass: "CC",
    passengerCount: 1,
    passengerCategory: "General",
    passengerName: user?.name || "",
    age: "",
    gender: "Other",
    berthPreference: "No Preference",
    cancellationProtection: false,
    autoUpgrade: false,
    splitPayment: false,
    paymentMethod: "UPI Simulation",
    walletAmountPaid: 0,
    captchaAnswer: "",
  });
  const loadTrain = useCallback(() => {
    Promise.all([api.get(`/trains/${id}`), api.get("/stations")])
      .then(([trainResponse, stationResponse]) => {
        const current = trainResponse.data.data;
        setTrain(current);
        setStations(stationResponse.data.data);
        setForm((previous) => ({
          ...previous,
          boardingStation: current.source?._id || "",
          destinationStation: current.destination?._id || "",
          passengerName: user?.name || "",
        }));
      })
      .catch(() => setMessage("Unable to load this train."));
  }, [id, user?.name]);

  useEffect(() => {
    loadTrain();
  }, [loadTrain]);

  // Socket.io keeps the Train Details screen updated without refreshing the page.
  // When an employee updates platform or delay details, the server emits trainUpdated.
  useSocket({ onTrainUpdated: loadTrain });
  const selectedClass = useMemo(
    () =>
      train?.availableClasses?.find((item) => item.code === form.travelClass),
    [train, form.travelClass],
  );
  const fare =
    Number(selectedClass?.baseFare || 850) * Number(form.passengerCount || 1);
  const walletBalance = Number(user?.walletBalance || 0);
  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const updatePaymentMethod = (value) =>
    setForm((current) => ({
      ...current,
      paymentMethod: value,
      walletAmountPaid:
        value === "Mock Wallet" ? fare : current.walletAmountPaid,
    }));
  const departureHasPassed = () => {
    if (!train?.scheduledDeparture || form.journeyDate !== formatDate(today)) return false;
    const [hours, minutes] = train.scheduledDeparture.split(":").map(Number);
    const departure = new Date();
    departure.setHours(hours, minutes, 0, 0);
    return departure <= new Date();
  };
  const book = async (event) => {
    event.preventDefault();
    setMessage("");
    if (!isAuthenticated)
      return setMessage("Please log in or register before booking a ticket.");
    if (form.boardingStation === form.destinationStation)
      return setMessage("Source and destination stations must be different.");
    if (
      new Date(form.journeyDate) < new Date(formatDate(today)) ||
      new Date(form.journeyDate) > maxDate
    )
      return setMessage(
        "Choose a date from today through the next two months.",
      );
    if (departureHasPassed())
      return setMessage(
        "This train has already departed today. Choose a future journey date.",
      );
    if (form.captchaAnswer.toUpperCase() !== captcha)
      return setMessage("Captcha is incorrect. Refresh it and try again.");
    try {
      const response = await api.post("/bookings", {
        train: id,
        journeyDate: form.journeyDate,
        boardingStation: form.boardingStation,
        destinationStation: form.destinationStation,
        travelClass: form.travelClass,
        passengerCount: Number(form.passengerCount),
        passengerCategory: form.passengerCategory,
        passengers: [
          {
            fullName: form.passengerName || user?.name,
            age: Number(form.age || 18),
            gender: form.gender,
            berthPreference: form.berthPreference,
          },
        ],
        totalFare: fare,
        cancellationProtection: form.cancellationProtection,
        autoUpgrade: form.autoUpgrade,
        paymentMethod:
          form.walletAmountPaid >= fare ? "Mock Wallet" : form.paymentMethod,
        walletAmountPaid: Number(form.walletAmountPaid),
        captchaAnswer: form.captchaAnswer,
        captchaChallenge: captcha,
      });
      navigate(`/booking-confirmation/${response.data.data._id}`);
    } catch (error) {
      setCaptcha(createCaptcha());
      setMessage(
        error.response?.data?.message || "Unable to create the booking.",
      );
    }
  };
  if (!train)
    return (
      <Portal title="Train details" eyebrow="Loading">
        <p className="text-text-secondary">
          {message || "Loading journey details..."}
        </p>
      </Portal>
    );
  return (
    <Portal title={train.trainName} eyebrow={`Train ${train.trainNumber}`}>
      <div className="mb-4 flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
        Live Demo Update
      </div>
      <Link
        to="/trains"
        className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-plum"
      >
        <ArrowLeft size={16} /> Back to train search
      </Link>
      <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <section className="rounded-3xl border border-plum/10 bg-white p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-text-secondary">
                {train.source?.name} to {train.destination?.name}
              </p>
              <p className="mt-2 font-display text-4xl">
                {train.scheduledDeparture || "--:--"}{" "}
                <span className="text-2xl text-slate-300">→</span>{" "}
                {train.scheduledArrival || "--:--"}
              </p>
            </div>
            <span
              className={
                train.status === "Delayed"
                  ? "rounded-full bg-amber-50 px-4 py-2 text-sm font-bold text-warning"
                  : "rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-success"
              }
            >
              {train.status}
              {train.delayMinutes ? ` · ${train.delayMinutes}m` : ""}
            </span>
          </div>
          <div className="mt-10 grid gap-5 border-t border-plum/10 pt-7 sm:grid-cols-3">
            <div>
              <Clock3 size={18} className="text-plum" />
              <p className="mt-3 text-xs text-text-secondary">Platform</p>
              <p className="font-bold">{train.platformNumber || "TBA"}</p>
            </div>
            <div>
              <MapPin size={18} className="text-plum" />
              <p className="mt-3 text-xs text-text-secondary">Route stops</p>
              <p className="font-bold">
                {train.routeStops?.length || 0} stations
              </p>
            </div>
            <div>
              <TrainFront size={18} className="text-plum" />
              <p className="mt-3 text-xs text-text-secondary">Classes</p>
              <p className="font-bold">
                {train.classesAvailable?.join(", ") || "Standard"}
              </p>
            </div>
          </div>
          {train.delayReason && (
            <p className="mt-7 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
              Delay reason: {train.delayReason}
            </p>
          )}
          <div className="mt-9">
            <h2 className="font-bold">Route timeline</h2>
            <div className="mt-5 grid gap-4">
              {train.routeStops?.map((stop) => (
                <div
                  key={stop.station?._id}
                  className="flex items-center gap-4 text-sm"
                >
                  <div className="h-3 w-3 rounded-full bg-plum" />
                  <span className="font-bold">{stop.station?.stationCode}</span>
                  <span className="text-text-secondary">
                    {stop.arrivalTime || "--:--"} →{" "}
                    {stop.departureTime || "--:--"}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-9 grid gap-3 sm:grid-cols-2">
            {train.availableClasses?.map((item) => (
              <div key={item.code} className="rounded-2xl bg-lavender-50 p-4">
                <div className="flex justify-between">
                  <span className="font-bold">{item.code}</span>
                  <span className="text-sm font-bold text-plum">
                    ₹{item.baseFare}
                  </span>
                </div>
                <p className="mt-2 text-xs text-text-secondary">
                  {item.name || "Travel class"} · {item.availableSeats} seats
                  available
                </p>
              </div>
            ))}
          </div>
        </section>
        <form
          onSubmit={book}
          className="rounded-3xl border border-plum/10 bg-white p-7"
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-plum" />
            <div>
              <h2 className="font-display text-2xl">Book this journey</h2>
              <p className="mt-1 text-sm font-semibold text-plum">Take the train that takes you out of your delusional world.</p>
              <p className="text-xs text-text-secondary">
                Academic simulation: no real ticket is generated.
              </p>
            </div>
          </div>
          {success ? (
            <div className="mt-7 rounded-3xl bg-emerald-50 p-6">
              <CheckCircle2 className="text-success" size={30} />
              <h3 className="mt-4 font-display text-2xl text-emerald-900">
                Booking confirmed
              </h3>
              <p className="mt-2 text-sm text-emerald-800">
                PNR {success.pnrNumber}
              </p>
              <p className="mt-1 text-sm text-emerald-800">
                Reference {success.bookingReference}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  to="/bookings"
                  className="rounded-xl bg-plum-950 px-4 py-3 text-sm font-bold text-white"
                >
                  View bookings
                </Link>
                <Link
                  to="/food"
                  className="rounded-xl border border-plum/20 px-4 py-3 text-sm font-bold text-plum"
                >
                  Order food
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              <label>
                <span className="field-label">
                  Journey date · max two months ahead
                </span>
                <input
                  required
                  type="date"
                  min={formatDate(today)}
                  max={formatDate(maxDate)}
                  value={form.journeyDate}
                  onChange={(event) =>
                    update("journeyDate", event.target.value)
                  }
                  className="field"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label>
                  <span className="field-label">From</span>
                  <select
                    value={form.boardingStation}
                    onChange={(event) =>
                      update("boardingStation", event.target.value)
                    }
                    className="field"
                  >
                    {stations.map((station) => (
                      <option key={station._id} value={station._id}>
                        {station.stationCode} · {station.city}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="field-label">To</span>
                  <select
                    value={form.destinationStation}
                    onChange={(event) =>
                      update("destinationStation", event.target.value)
                    }
                    className="field"
                  >
                    {stations.map((station) => (
                      <option key={station._id} value={station._id}>
                        {station.stationCode} · {station.city}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label>
                  <span className="field-label">Class</span>
                  <select
                    value={form.travelClass}
                    onChange={(event) =>
                      update("travelClass", event.target.value)
                    }
                    className="field"
                  >
                    {(train.availableClasses || []).map((item) => (
                      <option key={item.code}>{item.code}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="field-label">Passenger category</span>
                  <select
                    value={form.passengerCategory}
                    onChange={(event) =>
                      update("passengerCategory", event.target.value)
                    }
                    className="field"
                  >
                    <option>General</option>
                    <option>Army</option>
                    <option>Senior Citizen</option>
                  </select>
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label>
                  <span className="field-label">Passenger name</span>
                  <input
                    required
                    className="field"
                    value={form.passengerName}
                    onChange={(event) =>
                      update("passengerName", event.target.value)
                    }
                  />
                </label>
                <label>
                  <span className="field-label">Age</span>
                  <input
                    required
                    type="number"
                    min="1"
                    max="120"
                    className="field"
                    value={form.age}
                    onChange={(event) => update("age", event.target.value)}
                  />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label>
                  <span className="field-label">Passenger count</span>
                  <select
                    value={form.passengerCount}
                    onChange={(event) =>
                      update("passengerCount", event.target.value)
                    }
                    className="field"
                  >
                    {[1, 2, 3, 4, 5].map((number) => (
                      <option key={number}>{number}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="field-label">Berth preference</span>
                  <select
                    value={form.berthPreference}
                    onChange={(event) =>
                      update("berthPreference", event.target.value)
                    }
                    className="field"
                  >
                    <option>No Preference</option>
                    <option>Lower</option>
                    <option>Middle</option>
                    <option>Upper</option>
                    <option>Side Lower</option>
                    <option>Side Upper</option>
                  </select>
                </label>
              </div>
              <label className="flex items-center gap-3 rounded-2xl bg-lavender-50 p-4 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={form.autoUpgrade}
                  onChange={(event) =>
                    update("autoUpgrade", event.target.checked)
                  }
                />{" "}
                Consider me for auto upgradation
              </label>
              <label className="flex items-center gap-3 rounded-2xl bg-lavender-50 p-4 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={form.cancellationProtection}
                  onChange={(event) =>
                    update("cancellationProtection", event.target.checked)
                  }
                />{" "}
                Add cancellation protection
              </label>
              <div className="rounded-2xl border border-plum/10 p-4">
                <p className="text-sm font-bold">Fare summary · ₹{fare}</p>
                <p className="mt-1 text-xs text-text-secondary">
                  Wallet available: ₹{walletBalance}. Choose how much to use.
                </p>
                <label className="mt-3 flex items-center gap-3 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={form.splitPayment}
                    onChange={(event) => {
                      update("splitPayment", event.target.checked);
                      if (!event.target.checked) update("walletAmountPaid", 0);
                    }}
                  />
                  Use wallet plus another payment source
                </label>
                <input
                  type="number"
                  min="0"
                  max={Math.min(fare, walletBalance)}
                  value={form.walletAmountPaid}
                  onChange={(event) =>
                    update("walletAmountPaid", event.target.value)
                  }
                  className="field mt-3"
                  placeholder="Wallet amount"
                />
                <input
                  type="range"
                  min="0"
                  max={Math.min(fare, walletBalance)}
                  step="50"
                  value={Math.min(Number(form.walletAmountPaid), Math.min(fare, walletBalance))}
                  onChange={(event) => update("walletAmountPaid", event.target.value)}
                  disabled={!form.splitPayment}
                  className="mt-3 w-full accent-plum"
                  aria-label="Amount to pay from wallet"
                />
                <div className="flex justify-between text-xs text-text-secondary">
                  <span>Wallet: ₹{form.walletAmountPaid || 0}</span>
                  <span>Other source: ₹{Math.max(fare - Number(form.walletAmountPaid || 0), 0)}</span>
                </div>
                <select
                  value={form.paymentMethod}
                  onChange={(event) =>
                    updatePaymentMethod(event.target.value)
                  }
                  className="field mt-3"
                >
                  <option>UPI Simulation</option>
                  <option>Card Simulation</option>
                  <option>QR Payment Simulation</option>
                  <option>Mock Wallet</option>
                </select>
              </div>
              <div className="rounded-2xl bg-plum-950 p-4 text-white">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-lg tracking-[.3em]">
                    {captcha}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCaptcha(createCaptcha());
                      update("captchaAnswer", "");
                    }}
                    className="rounded-xl bg-white/10 p-2"
                    title="Refresh captcha"
                    aria-label="Refresh captcha"
                  >
                    <RefreshCw size={17} />
                  </button>
                </div>
                <input
                  required
                  className="mt-3 w-full rounded-xl border-0 bg-white px-4 py-3 text-ink"
                  placeholder="Enter captcha"
                  value={form.captchaAnswer}
                  onChange={(event) =>
                    update("captchaAnswer", event.target.value)
                  }
                />
              </div>
              {message && (
                <p className="text-sm font-semibold text-danger">{message}</p>
              )}
              <button className="rounded-2xl bg-plum-950 px-5 py-4 text-sm font-bold text-white transition hover:bg-purple-700">
                Continue to payment · ₹{fare}
              </button>
            </div>
          )}
        </form>
      </div>
    </Portal>
  );
}
