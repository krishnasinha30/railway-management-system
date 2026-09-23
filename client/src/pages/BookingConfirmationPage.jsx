import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Download,
  FileText,
  IndianRupee,
  MapPin,
  Ticket,
  TrainFront,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { jsPDF } from "jspdf";
import { Link, useParams } from "react-router-dom";
import api from "../api/axiosInstance";
import { Portal } from "./TrainSearchPage";

const terms = [
  "This ticket is an academic simulation and is not valid for travel.",
  "No real railway reservation, payment, refund, or cancellation is created.",
  "The PNR, coach, seat, fare, and payment details are generated for simulation purposes.",
  "Wallet, QR, UPI, and card payments are mock transactions stored in this project database.",
  "Journey changes and cancellations follow the simulation rules shown in the Railway Management System.",
  "Users should not enter real payment credentials or identity documents.",
  "By continuing, the passenger accepts the academic simulation terms.",
];

export default function BookingConfirmationPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const ticketRef = useRef(null);
  useEffect(() => {
    api
      .get(`/bookings/${id}`)
      .then((response) => setBooking(response.data.data))
      .catch((requestError) =>
        setError(
          requestError.response?.data?.message || "Unable to load the ticket.",
        ),
      );
  }, [id]);
  const downloadPdf = () => {
    if (!booking) return;
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const purple = [43, 10, 56];
    pdf.setFillColor(...purple);
    pdf.rect(0, 0, 595, 92, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.text("RC Rail Center", 40, 48);
    pdf.setFontSize(11);
    pdf.text("Railway Management System · Academic Simulation Ticket", 40, 68);
    pdf.setTextColor(36, 21, 42);
    pdf.setFontSize(18);
    pdf.text("Booking confirmation", 40, 135);
    pdf.setFontSize(11);
    const lines = [
      `PNR: ${booking.pnrNumber}`,
      `Reference: ${booking.bookingReference}`,
      `Passenger: ${booking.passenger?.name}`,
      `Email: ${booking.passenger?.email}`,
      `From: ${booking.boardingStation?.name} (${booking.boardingStation?.stationCode})`,
      `To: ${booking.destinationStation?.name} (${booking.destinationStation?.stationCode})`,
      `Train: ${booking.train?.trainNumber} · ${booking.train?.trainName}`,
      `Journey date: ${new Date(booking.journeyDate).toLocaleDateString()}`,
      `Class: ${booking.travelClass} · Category: ${booking.passengerCategory}`,
      `Passenger count: ${booking.passengerCount}`,
      `Coach / seat: ${booking.passengers?.map((item) => `${item.coachNumber}/${item.seatNumber}`).join(", ") || "Simulation allocation"}`,
      `Total fare: ₹${booking.totalFare}`,
      `Wallet paid: ₹${booking.walletAmountPaid || 0}`,
      `Other payment: ₹${Math.max(booking.totalFare - (booking.walletAmountPaid || 0), 0)} via ${booking.paymentMethod}`,
    ];
    lines.forEach((line, index) => pdf.text(line, 40, 170 + index * 20));
    pdf.setFontSize(10);
    pdf.text("Terms and conditions", 40, 490);
    terms.forEach((term, index) =>
      pdf.text(`${index + 1}. ${term}`, 40, 512 + index * 16, {
        maxWidth: 510,
      }),
    );
    pdf.save(`${booking.bookingReference}-mock-ticket.pdf`);
  };
  if (error)
    return (
      <Portal title="Ticket unavailable" eyebrow="Booking confirmation">
        <p className="text-danger">{error}</p>
      </Portal>
    );
  if (!booking)
    return (
      <Portal title="Booking confirmation" eyebrow="Loading">
        <p className="text-text-secondary">Loading your ticket...</p>
      </Portal>
    );
  const walletPaid = booking.walletAmountPaid || 0;
  const otherPaid = Math.max((booking.totalFare || 0) - walletPaid, 0);
  return (
    <Portal title="Booking confirmed" eyebrow="Payment and ticket details">
      <p className="mb-5 text-sm font-semibold text-plum">Your itinerary is more organized than your group chat. Beautiful.</p>
      <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
        <CheckCircle2 size={20} /> Your mock ticket and payment record are
        ready.
      </div>
      <div
        ref={ticketRef}
        className="overflow-hidden rounded-[2rem] border border-plum/10 bg-white shadow-soft"
      >
        <div className="flex flex-wrap items-center justify-between gap-5 bg-plum-950 p-7 text-white">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-lilac">
              RC Rail Center
            </p>
            <h2 className="mt-3 font-display text-3xl">Mock e-ticket</h2>
            <p className="mt-2 text-sm text-white/55">
              Railway Management System · Academic Simulation
            </p>
          </div>
          <QRCodeSVG
            value={`RMS|${booking.pnrNumber}|${booking.bookingReference}`}
            size={100}
            bgColor="#ffffff"
            fgColor="#1C0825"
            includeMargin
          />
        </div>
        <div className="grid gap-8 p-7 lg:grid-cols-[1fr_auto]">
          <div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Info label="PNR number" value={booking.pnrNumber} accent />
              <Info
                label="Booking reference"
                value={booking.bookingReference}
              />
              <Info label="Passenger" value={booking.passenger?.name} />
              <Info label="Passenger email" value={booking.passenger?.email} />
              <Info
                label="Journey date"
                value={new Date(booking.journeyDate).toLocaleDateString()}
              />
              <Info
                label="Class and category"
                value={`${booking.travelClass} · ${booking.passengerCategory}`}
              />
            </div>
            <div className="my-7 flex flex-wrap items-center gap-5 rounded-3xl bg-lavender-50 p-5">
              <div>
                <p className="text-xs text-text-secondary">From</p>
                <p className="mt-1 font-bold">
                  {booking.boardingStation?.stationCode}
                </p>
                <p className="text-sm text-text-secondary">
                  {booking.boardingStation?.name}
                </p>
              </div>
              <MapPin className="text-plum" size={20} />
              <div>
                <p className="text-xs text-text-secondary">To</p>
                <p className="mt-1 font-bold">
                  {booking.destinationStation?.stationCode}
                </p>
                <p className="text-sm text-text-secondary">
                  {booking.destinationStation?.name}
                </p>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Info
                label="Train"
                value={`${booking.train?.trainNumber} · ${booking.train?.trainName}`}
              />
              <Info
                label="Coach and seat"
                value={
                  booking.passengers
                    ?.map((item) => `${item.coachNumber} / ${item.seatNumber}`)
                    .join(", ") || "Simulation allocation"
                }
              />
              <Info label="Booking status" value={booking.bookingStatus} />
              <Info label="Payment status" value={booking.paymentStatus} />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-3">
            <Ticket className="text-plum" size={28} />
            <p className="text-xs font-bold uppercase tracking-[.16em] text-text-secondary">
                Scan simulation ticket
            </p>
            <p className="max-w-[130px] text-center text-xs text-text-secondary">
              QR contains only this mock booking reference.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="rounded-3xl border border-plum/10 bg-white p-6">
          <div className="flex items-center gap-3">
            <IndianRupee className="text-plum" size={20} />
            <h2 className="font-display text-2xl">Payment information</h2>
          </div>
          <div className="mt-5 grid gap-3 text-sm">
            <Row label="Total fare" value={`₹${booking.totalFare}`} />
            <Row label="Paid through wallet" value={`₹${walletPaid}`} />
            <Row
              label="Paid through ${booking.paymentMethod}"
              value={`₹${otherPaid}`}
            />
            <Row
              label="Cancellation protection"
              value={booking.cancellationProtection ? "Yes" : "No"}
            />
            <Row
              label="Auto upgradation"
              value={booking.autoUpgrade ? "Yes" : "No"}
            />
          </div>
        </section>
        <section className="rounded-3xl border border-plum/10 bg-white p-6">
          <div className="flex items-center gap-3">
            <FileText className="text-plum" size={20} />
            <h2 className="font-display text-2xl">Terms and conditions</h2>
          </div>
          <ol className="mt-5 grid gap-2 text-sm leading-6 text-text-secondary">
            {terms.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ol>
        </section>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={downloadPdf}
          className="inline-flex items-center gap-2 rounded-2xl bg-plum-950 px-5 py-3 text-sm font-bold text-white"
        >
          <Download size={17} />
          Download PDF ticket
        </button>
        <Link
          to="/bookings"
          className="inline-flex items-center gap-2 rounded-2xl border border-plum/20 px-5 py-3 text-sm font-bold text-plum"
        >
          View my bookings
        </Link>
        <Link
          to="/food"
          className="inline-flex items-center gap-2 rounded-2xl border border-plum/20 px-5 py-3 text-sm font-bold text-plum"
        >
          <TrainFront size={17} />
          Order food
        </Link>
      </div>
    </Portal>
  );
}

function Info({ label, value, accent = false }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[.12em] text-text-secondary">
        {label}
      </p>
      <p className={`mt-2 font-bold ${accent ? "text-plum" : "text-ink"}`}>
        {value || "—"}
      </p>
    </div>
  );
}
function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-plum/10 pb-3">
      <span className="text-text-secondary">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
