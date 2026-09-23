import { useCallback, useEffect, useState } from "react";
import { ChefHat, Plus, ShoppingBag } from "lucide-react";
import api from "../api/axiosInstance";
import useSocket from "../hooks/useSocket";
import { Portal } from "./TrainSearchPage";

export default function FoodPage() {
  const [vendors, setVendors] = useState([]);
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");

  const refreshFoodData = useCallback(() => {
    Promise.all([api.get("/food/vendors"), api.get("/food/orders")])
      .then(([vendorResponse, orderResponse]) => {
        setVendors(vendorResponse.data.data);
        setOrders(orderResponse.data.data);
      })
      .catch(() => setMessage("Sign in as a passenger to view food orders."));
  }, []);

  useEffect(() => {
    refreshFoodData();
  }, [refreshFoodData]);

  // Socket.io keeps the food-tracking page in sync. The admin emits foodOrderUpdated
  // after updating the order status, and the passenger screen refreshes without reload.
  useSocket({ onFoodOrderUpdated: refreshFoodData, onBookingUpdated: refreshFoodData });
  const order = async (vendor, item) => {
    try {
      const bookings = await api.get("/bookings/my-bookings");
      const booking = bookings.data.data.find(
        (item) => item.bookingStatus === "Confirmed",
      );
      if (!booking)
        return setMessage(
          "Create or confirm a booking before ordering food. Your hunger has a timetable too.",
        );
      const response = await api.post("/food/orders", {
        booking: booking._id,
        vendor: vendor._id,
        deliveryStation: vendor.station._id,
        items: [
          { itemName: item.itemName, quantity: 1, unitPrice: item.price },
        ],
        coachNumber: "C1",
        seatNumber: "21",
        paymentMethod: "Mock Wallet",
      });
      setOrders((current) => [response.data.data, ...current]);
      setMessage("Food order placed. Your stomach has officially boarded.");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to place food order.",
      );
    }
  };
  return (
    <Portal title="Food on your train" eyebrow="Simulated station delivery">
      <div className="mb-4 flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
        Live Demo Update
      </div>
      <div className="mb-6 rounded-2xl border border-purple-200 bg-purple-50 p-4 text-sm text-purple-900">
        Academic simulation: food vendors, menus, delivery, and wallet payment are
        simulated.
      </div>
      {message && <p className="mb-5 text-sm text-plum">{message}</p>}
      <div className="grid gap-6 lg:grid-cols-2">
        {vendors.map((vendor) => (
          <section
            key={vendor._id}
            className="rounded-3xl border border-ink/10 bg-white p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <ChefHat className="text-plum" />
                <h2 className="mt-4 font-display text-2xl">{vendor.name}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {vendor.station?.stationCode} ·{" "}
                  {vendor.cuisineTypes?.join(", ")} · ★ {vendor.rating}
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              {vendor.menu?.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-mist p-4"
                >
                  <div>
                    <p className="font-bold">{item.itemName}</p>
                    <p className="text-sm text-slate-500">
                      {item.isVeg ? "Vegetarian" : "Non-vegetarian"} · ₹
                      {item.price}
                    </p>
                  </div>
                  <button
                    onClick={() => order(vendor, item)}
                    aria-label={`Order ${item.itemName}`}
                    className="rounded-xl bg-ink p-2 text-white"
                  >
                    <Plus size={17} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      <section className="mt-8 rounded-3xl border border-ink/10 bg-white p-6">
        <div className="flex items-center gap-3">
          <ShoppingBag className="text-plum" />
          <h2 className="font-bold">My food orders</h2>
        </div>
        <div className="mt-5 grid gap-3">
          {orders.map((order) => (
            <div
              key={order._id}
              className="flex items-center justify-between rounded-2xl bg-mist p-4 text-sm"
            >
              <span className="font-bold">{order.orderReference}</span>
              <span>
                {order.items?.[0]?.itemName} · ₹{order.totalAmount}
              </span>
              <span className="font-bold text-plum">{order.orderStatus}</span>
            </div>
          ))}
        </div>
      </section>
    </Portal>
  );
}
