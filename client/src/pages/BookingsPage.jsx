import { useCallback, useEffect, useState } from "react";
import { Ban, CalendarDays, Search, TicketCheck } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyBookings } from "../features/bookings/bookingSlice";
import api from "../api/axiosInstance";
import { Portal } from "./TrainSearchPage";
import useSocket from "../hooks/useSocket";

export default function BookingsPage() {
  const dispatch = useDispatch();
  const { items = [], loading = false } = useSelector((state) => state?.bookings || {});
  const safeItems = Array.isArray(items) ? items : [];
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const refresh = useCallback(() => dispatch(fetchMyBookings()), [dispatch]);
  useEffect(() => {
    refresh();
  }, [refresh]);
  useSocket({ onBookingUpdated: refresh });
  const cancel = async (id) => {
    try {
      await api.put(`/bookings/${id}/cancel`);
      setMessage("Booking cancelled and refund processed. Even the timetable can handle a plot twist.");
      dispatch(fetchMyBookings());
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to cancel booking.");
    }
  };
  const visible = safeItems.filter(
    (item) =>
      !query ||
      `${item?.bookingReference || ''} ${item?.pnrNumber || ''} ${item?.train?.trainName || ''}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <Portal title="My booking requests" eyebrow="Passenger workspace">
      <div className="mb-6 rounded-2xl border border-purple-200 bg-purple-50 p-4 text-sm text-purple-900">
        Academic simulation: tickets, wallet payments, and refunds are simulated. No
        real railway ticket or payment is generated.
      </div>
      <div className="mb-6 flex max-w-xl gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-3.5 text-slate-400"
            size={18}
          />
          <input
            className="field pl-11"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search reference, PNR, or train"
          />
        </div>
      </div>
      {message && <p className="mb-5 text-sm text-emerald-700">{message}</p>}
      {loading ? (
        <p className="text-slate-500">Loading booking requests...</p>
      ) : (
        <div className="grid gap-4">
          {visible.map((item) => (
            <article
              key={item._id}
              className="rounded-3xl border border-ink/10 bg-white p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-plum">
                    {item.bookingReference}
                  </p>
                  <h2 className="mt-2 font-display text-2xl">
                    {item.train?.trainName || "Train reservation"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    PNR {item.pnrNumber || "Pending"} · {item.travelClass} ·{" "}
                    {item.passengerCount} passenger(s)
                  </p>
                </div>
                <span
                  className={
                    item.bookingStatus === "Cancelled"
                      ? "rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600"
                      : "rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
                  }
                >
                  {item.bookingStatus}
                </span>
              </div>
              <div className="mt-6 grid gap-4 border-t border-ink/10 pt-5 text-sm sm:grid-cols-3">
                <p>
                  <CalendarDays className="mr-2 inline text-plum" size={16} />
                  {new Date(item.journeyDate).toLocaleDateString()}
                </p>
                <p>
                  <TicketCheck className="mr-2 inline text-plum" size={16} />
                  Simulated fare ₹{item.totalFare || "—"}
                </p>
                <p className="sm:text-right">{item.paymentStatus}</p>
              </div>
              {item.bookingStatus !== "Cancelled" && (
                <button
                  onClick={() => cancel(item._id)}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-600"
                >
                  <Ban size={15} /> Cancel booking
                </button>
              )}
            </article>
          ))}
          {!visible.length && (
            <div className="rounded-3xl border border-dashed border-ink/20 bg-white p-12 text-center text-sm text-slate-500">
              No booking requests match your search.
            </div>
          )}
        </div>
      )}
    </Portal>
  );
}
