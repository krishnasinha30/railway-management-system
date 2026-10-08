const crypto = require('crypto');
const FoodVendor = require('../models/FoodVendor'); const FoodOrder = require('../models/FoodOrder'); const Booking = require('../models/Booking');
const { success, failure } = require('../utils/apiResponse'); const wallet = require('./walletController');
const { notifyUser, userRoom } = require('../services/notificationService');
const ref = prefix => `${prefix}-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
exports.vendors = async (req, res, next) => { try { const filter = req.query.station ? { station: req.query.station, isActive: true } : { isActive: true }; success(res, await FoodVendor.find(filter).populate('station')); } catch (e) { next(e); } };
exports.createVendor = async (req, res, next) => { try { success(res, await FoodVendor.create(req.body), 'Food vendor created', 201); } catch (e) { next(e); } };
exports.orders = async (req, res, next) => { try { const filter = req.user.role === 'admin' ? {} : { passenger: req.user._id }; success(res, await FoodOrder.find(filter).populate('vendor deliveryStation train booking').sort({ createdAt: -1 })); } catch (e) { next(e); } };
exports.createOrder = async (req, res, next) => {
  try {
    const { booking, vendor, deliveryStation, items, coachNumber, seatNumber, paymentMethod } = req.body;
    const bookingRecord = await Booking.findOne({ _id: booking, passenger: req.user._id, bookingStatus: 'Confirmed' });
    if (!bookingRecord) return failure(res, 'Choose one of your confirmed demo bookings', [], 400);
    const totalAmount = (items || []).reduce((sum, item) => sum + Number(item.unitPrice) * Number(item.quantity), 0);
    if (!totalAmount) return failure(res, 'Add at least one food item', [], 400);
    const order = await FoodOrder.create({
      orderReference: ref('FOOD'),
      passenger: req.user._id,
      booking,
      train: bookingRecord.train,
      vendor,
      deliveryStation,
      items,
      coachNumber,
      seatNumber,
      totalAmount,
      paymentMethod
    });
    const io = req.app.get('io');
    if (paymentMethod === 'Mock Wallet') {
      await wallet.apply({
        io,
        userId: req.user._id,
        type: 'Debit',
        amount: totalAmount,
        reason: `Food order ${order.orderReference}`,
        referenceType: 'FoodOrder',
        referenceId: order._id,
        createdBy: req.user._id
      });
    }
    io.to(userRoom(req.user._id)).emit('foodOrderUpdated', order);
    notifyUser(io, req.user._id, {
      type: 'food',
      title: 'Food order placed',
      message: `Your food order ${order.orderReference} has been placed.`,
      metadata: { orderId: order._id, referenceId: order.orderReference, orderStatus: order.orderStatus }
    }).catch(error => console.error(`[notification] Could not publish food order ${order.orderReference}: ${error.message}`));
    success(res, order, 'Demo food order placed', 201);
  } catch (e) { next(e); }
};
exports.updateOrder = async (req, res, next) => {
  try {
    const order = await FoodOrder.findByIdAndUpdate(
      req.params.id,
      { orderStatus: req.body.orderStatus },
      { new: true, runValidators: true }
    ).populate('vendor deliveryStation train booking passenger');
    if (!order) return failure(res, 'Food order not found', [], 404);
    const io = req.app.get('io');
    io.to(userRoom(order.passenger._id)).emit('foodOrderUpdated', order);
    notifyUser(io, order.passenger._id, {
      type: 'food',
      title: 'Food order updated',
      message: `Your food order ${order.orderReference} is now ${order.orderStatus.toLowerCase()}.`,
      metadata: { orderId: order._id, referenceId: order.orderReference, orderStatus: order.orderStatus }
    }).catch(error => console.error(`[notification] Could not publish food order ${order.orderReference}: ${error.message}`));
    success(res, order, 'Food order updated');
  } catch (e) { next(e); }
};
