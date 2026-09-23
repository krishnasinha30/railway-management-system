import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Camera,
  Check,
  Clock3,
  CreditCard,
  Plus,
  Save,
  Trash2,
  UserRound,
} from "lucide-react";
import api from "../api/axiosInstance";
import { Portal } from "./TrainSearchPage";

const emptyPassenger = {
  fullName: "",
  age: "",
  gender: "Other",
  berthPreference: "No Preference",
};

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", profileImage: "" });
  const [passenger, setPassenger] = useState(emptyPassenger);
  const [message, setMessage] = useState("");
  useEffect(() => {
    Promise.all([api.get("/auth/me"), api.get("/bookings/my-bookings")])
      .then(([userResponse, bookingResponse]) => {
        const current = userResponse.data.data.user;
        setUser(current);
        setForm({
          name: current.name || "",
          phone: current.phone || "",
          profileImage: current.profileImage || "",
        });
        setBookings(bookingResponse.data.data);
      })
      .catch(() => setMessage("Unable to load your profile."));
  }, []);
  const saveProfile = async (event) => {
    event.preventDefault();
    try {
      const response = await api.put("/auth/profile", form);
      setUser(response.data.data);
      setMessage("Profile updated.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to update profile.");
    }
  };
  const addPassenger = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post("/auth/saved-passengers", {
        ...passenger,
        age: Number(passenger.age),
      });
      setUser((current) => ({
        ...current,
        savedPassengers: response.data.data,
      }));
      setPassenger(emptyPassenger);
      setMessage("Saved passenger added.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to save passenger.");
    }
  };
  const removePassenger = async (id) => {
    const response = await api.delete(`/auth/saved-passengers/${id}`);
    setUser((current) => ({ ...current, savedPassengers: response.data.data }));
  };
  const today = new Date();
  const upcoming = useMemo(
    () =>
      bookings.filter(
        (item) =>
          item.bookingStatus !== "Cancelled" &&
          new Date(item.journeyDate) >= today,
      ),
    [bookings],
  );
  const past = useMemo(
    () =>
      bookings.filter(
        (item) =>
          item.bookingStatus === "Cancelled" ||
          new Date(item.journeyDate) < today,
      ),
    [bookings],
  );
  if (!user)
    return (
      <Portal title="Your profile" eyebrow="Loading">
        <p className="text-text-secondary">
          Loading your saved travel details...
        </p>
      </Portal>
    );
  return (
    <Portal title="Your profile" eyebrow="Passenger workspace">
      <div className="mb-6 rounded-2xl border border-purple-200 bg-purple-50 p-4 text-sm text-purple-900">
        Keep your passenger details here so future simulated bookings can start with
        saved information. Profile photos use a local image URL and are not
        uploaded to a third-party service.
      </div>
      {message && (
        <p className="mb-5 text-sm font-semibold text-plum">{message}</p>
      )}
      <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <section className="rounded-3xl bg-plum-950 p-7 text-white">
          <div className="flex items-center gap-4">
            {form.profileImage ? (
              <img
                src={form.profileImage}
                alt="Profile"
                className="h-16 w-16 rounded-2xl object-cover"
              />
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10">
                <UserRound size={26} />
              </div>
            )}
            <div>
              <p className="font-display text-2xl">{user.name}</p>
              <p className="text-sm text-white/55">{user.email}</p>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs text-white/50">Wallet balance</p>
              <p className="mt-2 text-xl font-bold">
                ₹{user.walletBalance ?? 0}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs text-white/50">Member since</p>
              <p className="mt-2 text-sm font-bold">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </section>
        <form
          onSubmit={saveProfile}
          className="rounded-3xl border border-plum/10 bg-white p-6"
        >
          <h2 className="font-display text-2xl">Personal information</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="field-label">Full name</span>
              <input
                className="field"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                required
              />
            </label>
            <label>
              <span className="field-label">Phone</span>
              <input
                className="field"
                value={form.phone}
                onChange={(event) =>
                  setForm({ ...form, phone: event.target.value })
                }
                placeholder="+91"
              />
            </label>
            <label className="sm:col-span-2">
              <span className="field-label">
                <Camera className="mr-1 inline" size={14} />
                Profile photo URL
              </span>
              <input
                className="field"
                value={form.profileImage}
                onChange={(event) =>
                  setForm({ ...form, profileImage: event.target.value })
                }
                placeholder="https://..."
              />
            </label>
          </div>
          <button className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-plum-950 px-5 py-3 text-sm font-bold text-white">
            <Save size={16} />
            Save profile
          </button>
        </form>
      </div>
      <section className="mt-8 rounded-3xl border border-plum/10 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Saved for faster booking</p>
            <h2 className="mt-2 font-display text-3xl">Saved passengers</h2>
          </div>
          <CreditCard className="text-plum" />
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {user.savedPassengers?.map((saved) => (
            <div
              className="flex items-center justify-between rounded-2xl bg-lavender-50 p-4"
              key={saved._id}
            >
              <div>
                <p className="font-bold">{saved.fullName}</p>
                <p className="mt-1 text-xs text-text-secondary">
                  {saved.age} years · {saved.gender} · {saved.berthPreference}
                </p>
              </div>
              <button
                aria-label={`Remove ${saved.fullName}`}
                onClick={() => removePassenger(saved._id)}
                className="rounded-xl p-2 text-danger hover:bg-red-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <form
          onSubmit={addPassenger}
          className="mt-6 grid gap-3 border-t border-plum/10 pt-6 sm:grid-cols-2 lg:grid-cols-5"
        >
          <input
            className="field"
            placeholder="Full name"
            value={passenger.fullName}
            onChange={(event) =>
              setPassenger({ ...passenger, fullName: event.target.value })
            }
            required
          />
          <input
            className="field"
            type="number"
            min="1"
            max="120"
            placeholder="Age"
            value={passenger.age}
            onChange={(event) =>
              setPassenger({ ...passenger, age: event.target.value })
            }
            required
          />
          <select
            className="field"
            value={passenger.gender}
            onChange={(event) =>
              setPassenger({ ...passenger, gender: event.target.value })
            }
          >
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
          <select
            className="field"
            value={passenger.berthPreference}
            onChange={(event) =>
              setPassenger({
                ...passenger,
                berthPreference: event.target.value,
              })
            }
          >
            <option>No Preference</option>
            <option>Lower</option>
            <option>Middle</option>
            <option>Upper</option>
            <option>Side Lower</option>
            <option>Side Upper</option>
          </select>
          <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-plum px-4 py-3 text-sm font-bold text-white">
            <Plus size={16} />
            Add
          </button>
        </form>
      </section>
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <BookingColumn
          title="Upcoming bookings"
          icon={Clock3}
          items={upcoming}
          empty="No upcoming journeys yet."
        />
        <BookingColumn
          title="Past bookings"
          icon={CalendarDays}
          items={past}
          empty="Your completed and cancelled journeys will appear here."
        />
      </section>
    </Portal>
  );
}

function BookingColumn({ title, icon: Icon, items, empty }) {
  return (
    <section className="rounded-3xl border border-plum/10 bg-white p-6">
      <div className="flex items-center gap-3">
        <Icon className="text-plum" size={19} />
        <h2 className="font-display text-2xl">{title}</h2>
      </div>
      <div className="mt-5 grid gap-3">
        {items.length ? (
          items.map((item) => (
            <div className="rounded-2xl bg-lavender-50 p-4" key={item._id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">
                    {item.train?.trainName || "Train journey"}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {item.train?.trainNumber} · PNR{" "}
                    {item.pnrNumber || "Pending"}
                  </p>
                </div>
                <span className="text-xs font-bold text-plum">
                  ₹{item.totalFare || 0}
                </span>
              </div>
              <p className="mt-3 text-xs text-text-secondary">
                {new Date(item.journeyDate).toLocaleDateString()} ·{" "}
                {item.travelClass} · {item.bookingStatus}
              </p>
            </div>
          ))
        ) : (
          <p className="rounded-2xl bg-lavender-50 p-4 text-sm text-text-secondary">
            {empty}
          </p>
        )}
      </div>
    </section>
  );
}
