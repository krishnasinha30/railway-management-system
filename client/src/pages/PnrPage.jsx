import { useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import api from "../api/axiosInstance";
import { Portal } from "./TrainSearchPage";

export default function PnrPage() {
  const [pnr, setPnr] = useState("");
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    if (!/^\d{10}$/.test(pnr))
      return setMessage("Enter exactly 10 digits for a simulated PNR.");
    try {
      const response = await api.get(`/bookings/pnr/${pnr}`);
      setResult(response.data.data);
      setMessage("");
    } catch (error) {
      setResult(null);
      setMessage(error.response?.data?.message || "PNR not found.");
    }
  };
  return (
    <Portal title="PNR status" eyebrow="Simulated journey tracking">
      <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        This is simulated PNR data for academic purposes, not live Indian
        Railways confirmation data.
      </div>
      <form onSubmit={submit} className="flex max-w-xl gap-3">
        <input
          required
          inputMode="numeric"
          maxLength="10"
          className="field"
          value={pnr}
          onChange={(event) => setPnr(event.target.value.replace(/\D/g, ""))}
          placeholder="Enter 10-digit mock PNR"
        />
        <button className="rounded-2xl bg-ink px-6 text-white">
          <Search size={19} />
        </button>
      </form>
      {message && <p className="mt-5 text-sm text-red-600">{message}</p>}
      {result && (
        <section className="mt-8 rounded-3xl border border-ink/10 bg-white p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-plum">
                {result.booking.pnrNumber}
              </p>
              <h2 className="mt-2 font-display text-3xl">
                {result.booking.train?.trainName}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {result.booking.bookingReference} ·{" "}
                {result.booking.bookingStatus}
              </p>
            </div>
            <ShieldCheck className="text-emerald-600" />
          </div>
          <div className="mt-7 grid gap-4 border-t border-ink/10 pt-6 sm:grid-cols-3">
            <p>
              <span className="block text-xs text-slate-400">Journey</span>
              {new Date(result.booking.journeyDate).toLocaleDateString()}
            </p>
            <p>
              <span className="block text-xs text-slate-400">Passengers</span>
              {result.booking.passengerCount}
            </p>
            <p>
              <span className="block text-xs text-slate-400">Simulation chance</span>
              {result.simulationConfirmationChance}%
            </p>
          </div>
        </section>
      )}
    </Portal>
  );
}
