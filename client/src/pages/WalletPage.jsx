import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  History,
  Landmark,
  WalletCards,
} from "lucide-react";
import api from "../api/axiosInstance";
import useSocket from "../hooks/useSocket";
import { Portal } from "./TrainSearchPage";

export default function WalletPage() {
  const [wallet, setWallet] = useState({ user: {}, transactions: [] });
  const [amount, setAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [promo, setPromo] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const load = useCallback(
    () =>
      api
        .get("/wallet/mine")
        .then((response) => setWallet(response.data.data))
        .catch(() => setError("Unable to load your wallet statement.")),
    [],
  );
  useEffect(() => {
    load();
  }, [load]);
  useSocket({ onWalletUpdated: load });
  const run = async (request, successMessage) => {
    setError("");
    setMessage("");
    try {
      await request();
      await load();
      setMessage(successMessage);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Wallet action failed.");
    }
  };
  const add = (value) =>
    run(
      () => api.post("/wallet/add-money", { amount: value }),
      `₹${value} added and recorded in your statement.`,
    );
  const withdraw = (event) => {
    event.preventDefault();
    run(
      () => api.post("/wallet/withdraw", { amount: withdrawAmount }),
      `₹${withdrawAmount} withdrawal recorded to the source account.`,
    );
    setWithdrawAmount("");
  };
  const applyPromo = (event) => {
    event.preventDefault();
    run(
      () => api.post("/wallet/promo", { code: promo }),
      "₹150 promo credit added and recorded.",
    );
    setPromo("");
  };
  const transactions = wallet.transactions || [];
  return (
    <Portal title="Mock wallet" eyebrow="Passenger workspace">
      <div className="mb-6 rounded-2xl border border-purple-200 bg-purple-50 p-4 text-sm text-purple-900">
        Academic simulation: wallet money is simulated. Every top-up, booking payment,
        food payment, refund, withdrawal, and promo credit is stored as a wallet
        transaction.
      </div>
      {message && (
        <p className="mb-4 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          {message}
        </p>
      )}
      {error && (
        <p className="mb-4 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
      <div className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
        <section className="rounded-3xl bg-ink p-7 text-white shadow-soft">
          <WalletCards className="text-lilac" />
          <p className="mt-10 text-sm text-white/55">Current balance</p>
          <p className="mt-2 font-display text-5xl">
            ₹{wallet.user?.walletBalance ?? 0}
          </p>
          <p className="mt-3 text-xs text-white/45">
            Balance is loaded from your MongoDB wallet record.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {[500, 1000, 2000].map((value) => (
              <button
                key={value}
                onClick={() => add(value)}
                className="rounded-xl border border-white/20 px-3 py-2 text-xs font-bold hover:bg-white/10"
              >
                + ₹{value}
              </button>
            ))}
          </div>
          <label className="mt-6 block">
            <span className="text-xs font-bold text-white/60">
              Custom simulation top-up
            </span>
            <div className="mt-2 flex gap-2">
              <input
                className="min-w-0 flex-1 rounded-xl border-0 px-3 py-2 text-ink"
                type="number"
                min="1"
                max="50000"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="Amount"
              />
              <button
                onClick={() => {
                  add(amount);
                  setAmount("");
                }}
                className="rounded-xl bg-lilac px-3 py-2 text-xs font-bold text-ink"
              >
                Add
              </button>
            </div>
          </label>
        </section>
        <section className="grid gap-4">
          <form
            onSubmit={withdraw}
            className="rounded-3xl border border-plum/10 bg-white p-6"
          >
            <div className="flex items-center gap-3">
              <Landmark className="text-plum" size={20} />
              <div>
                <h2 className="font-bold">Withdraw to source account</h2>
                <p className="text-xs text-text-secondary">
                  This is a mock debit, not a real bank transfer.
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <input
                className="field"
                type="number"
                min="1"
                max={wallet.user?.walletBalance || 0}
                value={withdrawAmount}
                onChange={(event) => setWithdrawAmount(event.target.value)}
                placeholder="Amount"
              />
              <button className="rounded-2xl bg-plum-950 px-4 text-sm font-bold text-white">
                Withdraw
              </button>
            </div>
          </form>
          <form
            onSubmit={applyPromo}
            className="rounded-3xl border border-plum/10 bg-white p-6"
          >
            <div className="flex items-center gap-3">
              <Gift className="text-plum" size={20} />
              <div>
                <h2 className="font-bold">Apply promo code</h2>
                <p className="text-xs text-text-secondary">
                  Correct code gives ₹150 once. Wrong code is rejected.
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <input
                className="field"
                value={promo}
                onChange={(event) => setPromo(event.target.value)}
                placeholder="Enter code"
              />
              <button className="rounded-2xl bg-plum-950 px-4 text-sm font-bold text-white">
                Apply
              </button>
            </div>
          </form>
        </section>
      </div>
      <section className="mt-8 rounded-3xl border border-plum/10 bg-white p-6">
        <div className="flex items-center gap-3">
          <History className="text-plum" size={20} />
          <div>
            <h2 className="font-display text-2xl">Wallet statement</h2>
            <p className="text-sm text-text-secondary">
              Your last {transactions.length} recorded transactions.
            </p>
          </div>
        </div>
        <div className="mt-5 divide-y divide-ink/10">
          {transactions.length ? (
            transactions.map((transaction) => (
              <div
                key={transaction._id}
                className="flex flex-wrap items-center justify-between gap-4 py-4"
              >
                <div className="flex items-center gap-3">
                  {transaction.type === "Debit" ? (
                    <ArrowUpRight className="text-danger" size={19} />
                  ) : (
                    <ArrowDownLeft className="text-success" size={19} />
                  )}
                  <div>
                    <p className="text-sm font-bold">{transaction.reason}</p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {new Date(transaction.createdAt).toLocaleString()} ·{" "}
                      {transaction.referenceType}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold ${transaction.type === "Debit" ? "text-danger" : "text-success"}`}
                  >
                    {transaction.type === "Debit" ? "-" : "+"}₹
                    {transaction.amount}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    Balance ₹{transaction.balanceAfterTransaction}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-lavender-50 p-6 text-sm text-text-secondary">
              No wallet transactions yet. Add simulated money or use a promo code to
              create your first statement entry.
            </div>
          )}
        </div>
      </section>
    </Portal>
  );
}
