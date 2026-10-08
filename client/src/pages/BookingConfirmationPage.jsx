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

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const PAGE_MARGIN = 42;
const PAGE_CONTENT_BOTTOM = PAGE_HEIGHT - 108;
const pdfColors = {
  plum: [36, 8, 48],
  purple: [116, 54, 145],
  ink: [35, 29, 43],
  muted: [101, 94, 111],
  border: [229, 222, 234],
  pale: [248, 245, 250],
  white: [255, 255, 255],
};

const pdfDate = value => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not provided"
    : new Intl.DateTimeFormat("en-IN", {
        dateStyle: "long",
        timeZone: "Asia/Kolkata",
      }).format(date);
};

const pdfAmount = value =>
  `INR ${new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0)}`;

const svgToPng = async (svgElement, size = 256) => {
  if (!svgElement) throw new Error("Ticket QR code is not available.");
  const markup = new XMLSerializer().serializeToString(svgElement);
  const url = URL.createObjectURL(new Blob([markup], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Unable to prepare ticket artwork.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, size, size);
    context.drawImage(image, 0, 0, size, size);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
};

const loadPng = async (source, size = 256) => {
  const image = new Image();
  image.src = source;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to prepare Rail Center logo.");
  context.drawImage(image, 0, 0, size, size);
  return canvas.toDataURL("image/png");
};

export default function BookingConfirmationPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
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
  const downloadPdf = async () => {
    if (!booking) return;
    setIsGeneratingPdf(true);
    setError("");
    try {
      const pdf = new jsPDF({ unit: "pt", format: "a4", compress: true });
      const logo = await loadPng("/logo.svg");
      const qr = await svgToPng(ticketRef.current?.querySelector("svg"));
      const walletPaid = Number(booking.walletAmountPaid) || 0;
      const totalFare = Number(booking.totalFare) || 0;
      const remaining = Math.max(totalFare - walletPaid, 0);
      let y = 0;

      const drawHeader = (continued = false) => {
        pdf.setFillColor(...pdfColors.plum);
        pdf.rect(0, 0, PAGE_WIDTH, 94, "F");
        pdf.setFillColor(...pdfColors.purple);
        pdf.roundedRect(PAGE_MARGIN, 23, 48, 48, 12, 12, "F");
        pdf.addImage(logo, "PNG", PAGE_MARGIN + 6, 29, 36, 36);
        pdf.setTextColor(...pdfColors.white);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(21);
        pdf.text("RC Rail Center", PAGE_WIDTH / 2, 46, { align: "center" });
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(224, 211, 231);
        pdf.text(
          continued ? "E-TICKET · BOOKING DETAILS (CONTINUED)" : "E-TICKET · BOOKING DETAILS",
          PAGE_WIDTH / 2,
          65,
          { align: "center" },
        );
        pdf.setDrawColor(255, 255, 255);
        pdf.setLineWidth(0.6);
        pdf.line(PAGE_WIDTH - PAGE_MARGIN - 48, 47, PAGE_WIDTH - PAGE_MARGIN, 47);
      };

      const drawFooter = pageNumber => {
        const configuredContacts = [
          import.meta.env.VITE_SUPPORT_EMAIL && `Email: ${import.meta.env.VITE_SUPPORT_EMAIL}`,
          import.meta.env.VITE_SUPPORT_PHONE && `Phone: ${import.meta.env.VITE_SUPPORT_PHONE}`,
        ].filter(Boolean);
        const contactLine = configuredContacts.length
          ? configuredContacts.join("  ·  ")
          : "Contact the administrator who issued this ticket.";
        pdf.setDrawColor(...pdfColors.border);
        pdf.setLineWidth(0.8);
        pdf.line(PAGE_MARGIN, PAGE_HEIGHT - 86, PAGE_WIDTH - PAGE_MARGIN, PAGE_HEIGHT - 86);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8.5);
        pdf.setTextColor(...pdfColors.ink);
        pdf.text("HELP & CONTACT", PAGE_MARGIN, PAGE_HEIGHT - 68);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...pdfColors.muted);
        pdf.setFontSize(8);
        pdf.text(pdf.splitTextToSize(contactLine, PAGE_WIDTH - PAGE_MARGIN * 2 - 28).slice(0, 1), PAGE_MARGIN, PAGE_HEIGHT - 53);
        pdf.text("Academic simulation only · Not valid for travel or real payment.", PAGE_MARGIN, PAGE_HEIGHT - 29);
        pdf.setTextColor(...pdfColors.muted);
        pdf.text(`${pageNumber}`, PAGE_WIDTH - PAGE_MARGIN, PAGE_HEIGHT - 29, { align: "right" });
      };

      const startPage = (continued = false) => {
        if (pdf.getNumberOfPages() > 1) pdf.addPage();
        drawHeader(continued);
        y = 120;
      };

      const ensureSpace = (height) => {
        if (y + height > PAGE_CONTENT_BOTTOM) startPage(true);
      };

      const drawSection = title => {
        ensureSpace(34);
        pdf.setFillColor(...pdfColors.purple);
        pdf.roundedRect(PAGE_MARGIN, y, 4, 17, 2, 2, "F");
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.setTextColor(...pdfColors.ink);
        pdf.text(title.toUpperCase(), PAGE_MARGIN + 13, y + 12);
        y += 27;
      };

      const drawCard = (x, top, width, height, fill = pdfColors.white) => {
        pdf.setFillColor(...fill);
        pdf.setDrawColor(...pdfColors.border);
        pdf.setLineWidth(0.7);
        pdf.roundedRect(x, top, width, height, 10, 10, "FD");
      };

      const drawLabelValue = (label, value, x, top, width) => {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7.5);
        pdf.setTextColor(...pdfColors.muted);
        pdf.text(label.toUpperCase(), x, top);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9.5);
        pdf.setTextColor(...pdfColors.ink);
        const lines = pdf.splitTextToSize(String(value || "—"), width);
        pdf.text(lines.slice(0, 2), x, top + 14);
      };

      const drawPair = (left, right, rowHeight = 39) => {
        ensureSpace(rowHeight);
        const colGap = 18;
        const colWidth = (PAGE_WIDTH - PAGE_MARGIN * 2 - colGap) / 2;
        drawLabelValue(left[0], left[1], PAGE_MARGIN + 13, y + 15, colWidth - 26);
        drawLabelValue(right[0], right[1], PAGE_MARGIN + colWidth + colGap + 13, y + 15, colWidth - 26);
        return y + rowHeight;
      };

      const stationName = station => station?.name || station?.stationCode || "Not provided";
      const trainName = `${booking.train?.trainNumber || ""} ${booking.train?.trainName || ""}`.trim() || "Train details unavailable";
      const passengers = booking.passengers?.length ? booking.passengers : [{
        fullName: booking.passenger?.name || "Passenger",
        age: "",
        gender: "",
        coachNumber: "",
        seatNumber: ""
      }];

      drawHeader();
      y = 116;
      drawCard(PAGE_MARGIN, y, PAGE_WIDTH - PAGE_MARGIN * 2, 63, pdfColors.pale);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.setTextColor(...pdfColors.muted);
      pdf.text("PNR / BOOKING REFERENCE", PAGE_MARGIN + 15, y + 18);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(17);
      pdf.setTextColor(...pdfColors.plum);
      pdf.text(String(booking.pnrNumber || "PNR pending"), PAGE_MARGIN + 15, y + 41);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(...pdfColors.ink);
      pdf.text(`Reference  ${booking.bookingReference || "—"}`, PAGE_WIDTH - PAGE_MARGIN - 15, y + 29, { align: "right" });
      y += 79;

      drawSection("Ticket information");
      const routeCardHeight = 75;
      ensureSpace(routeCardHeight);
      drawCard(PAGE_MARGIN, y, PAGE_WIDTH - PAGE_MARGIN * 2, routeCardHeight, pdfColors.pale);
      const routeMid = PAGE_WIDTH / 2;
      drawLabelValue("From", `${stationName(booking.boardingStation)}${booking.boardingStation?.stationCode ? ` (${booking.boardingStation.stationCode})` : ""}`, PAGE_MARGIN + 15, y + 21, 185);
      drawLabelValue("To", `${stationName(booking.destinationStation)}${booking.destinationStation?.stationCode ? ` (${booking.destinationStation.stationCode})` : ""}`, routeMid + 12, y + 21, 180);
      pdf.setDrawColor(...pdfColors.border);
      pdf.line(routeMid, y + 13, routeMid, y + routeCardHeight - 13);
      y += routeCardHeight + 9;

      y = drawPair(["Train", trainName], ["Journey date", pdfDate(booking.journeyDate)]);
      y = drawPair(["Travel class", `${booking.travelClass || "—"} · ${booking.passengerCategory || "General"}`], ["Booking status", booking.bookingStatus || "—"]);
      y = drawPair(["Passenger count", `${booking.passengerCount || passengers.length}`], ["Departure", booking.train?.scheduledDeparture || "As scheduled"]);
      y += 5;

      drawSection("User information");
      y = drawPair(["Account holder", booking.passenger?.name || "—"], ["Email address", booking.passenger?.email || "—"]);
      y = drawPair(["Contact phone", booking.passenger?.phone || "Not provided"], ["Payment status", booking.paymentStatus || "—"]);
      y += 5;

      drawSection("Passenger details");
      const tableX = PAGE_MARGIN;
      const tableWidth = PAGE_WIDTH - PAGE_MARGIN * 2;
      const rowHeight = 25;
      const colX = [tableX + 11, tableX + 205, tableX + 262, tableX + 326, tableX + 400];
      const tableHeader = () => {
        ensureSpace(rowHeight + 3);
        pdf.setFillColor(...pdfColors.plum);
        pdf.roundedRect(tableX, y, tableWidth, rowHeight, 6, 6, "F");
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7);
        pdf.setTextColor(...pdfColors.white);
        ["PASSENGER NAME", "AGE / GENDER", "COACH", "SEAT", "STATUS"].forEach((label, index) => pdf.text(label, colX[index], y + 16));
        y += rowHeight;
      };
      tableHeader();
      passengers.forEach((passenger, index) => {
        if (y + rowHeight > PAGE_CONTENT_BOTTOM) {
          startPage(true);
          drawSection("Passenger information · continued");
          tableHeader();
        }
        pdf.setFillColor(...(index % 2 ? pdfColors.white : pdfColors.pale));
        pdf.rect(tableX, y, tableWidth, rowHeight, "F");
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(...pdfColors.ink);
        const cells = [
          passenger.fullName || booking.passenger?.name || "Passenger",
          [passenger.age, passenger.gender].filter(Boolean).join(" / ") || "—",
          passenger.coachNumber || "—",
          passenger.seatNumber || "—",
          passenger.bookingStatus || booking.bookingStatus || "—"
        ];
        cells.forEach((value, index) => pdf.text(pdf.splitTextToSize(String(value), index === 0 ? 180 : 57)[0], colX[index], y + 16));
        y += rowHeight;
      });
      y += 15;

      drawSection("Payment and taxes");
      const paymentRows = [
        ["Payment status", booking.paymentStatus || "—"],
        ["Payment method", booking.paymentMethod || "—"],
        ["Wallet amount", pdfAmount(walletPaid)],
        ["Other payment", `${pdfAmount(remaining)}${remaining > 0 ? ` · ${booking.paymentMethod || "other method"}` : ""}`],
        ["Taxes and charges", "Included in fare; separate tax breakdown unavailable"],
        ["Total fare", pdfAmount(totalFare)]
      ];
      paymentRows.forEach(([label, value], index) => {
        const height = index === paymentRows.length - 1 ? 32 : 26;
        ensureSpace(height);
        if (index === paymentRows.length - 1) {
          pdf.setFillColor(...pdfColors.pale);
          pdf.roundedRect(PAGE_MARGIN, y, PAGE_WIDTH - PAGE_MARGIN * 2, height, 6, 6, "F");
        } else if (index % 2 === 0) {
          pdf.setFillColor(252, 251, 253);
          pdf.rect(PAGE_MARGIN, y, PAGE_WIDTH - PAGE_MARGIN * 2, height, "F");
        }
        pdf.setFont("helvetica", index === paymentRows.length - 1 ? "bold" : "normal");
        pdf.setFontSize(index === paymentRows.length - 1 ? 9.5 : 8);
        pdf.setTextColor(...(index === paymentRows.length - 1 ? pdfColors.plum : pdfColors.ink));
        pdf.text(label, PAGE_MARGIN + 12, y + (height === 32 ? 20 : 17));
        pdf.text(value, PAGE_WIDTH - PAGE_MARGIN - 12, y + (height === 32 ? 20 : 17), { align: "right" });
        y += height;
      });
      y += 16;

      ensureSpace(76);
      drawCard(PAGE_MARGIN, y, PAGE_WIDTH - PAGE_MARGIN * 2, 64, pdfColors.pale);
      pdf.addImage(qr, "PNG", PAGE_MARGIN + 10, y + 7, 50, 50);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(...pdfColors.ink);
      pdf.text("TICKET REFERENCE", PAGE_MARGIN + 73, y + 24);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(...pdfColors.muted);
      pdf.text(`Scan to verify this simulated ticket · ${booking.bookingReference || ""}`, PAGE_MARGIN + 73, y + 40);
      pdf.text(`PNR ${booking.pnrNumber || "—"} · ${booking.bookingStatus || "—"}`, PAGE_MARGIN + 73, y + 53);

      const pageCount = pdf.getNumberOfPages();
      for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
        pdf.setPage(pageNumber);
        drawFooter(pageNumber);
      }
      pdf.save(`${booking.bookingReference}-ticket.pdf`);
    } catch (pdfError) {
      console.error("Unable to generate ticket PDF:", pdfError);
      setError(pdfError.message || "Unable to generate the ticket PDF. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
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
          disabled={isGeneratingPdf}
          className="inline-flex items-center gap-2 rounded-2xl bg-plum-950 px-5 py-3 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60"
        >
          <Download size={17} />
          {isGeneratingPdf ? "Preparing PDF..." : "Download PDF ticket"}
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
