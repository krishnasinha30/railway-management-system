const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { success, failure } = require('../utils/apiResponse');

exports.register = async (req, res, next) => {
  try {
    const { name, password, role } = req.body;
    const email = (req.body.email || '').trim().toLowerCase();
    const safeRole = ['passenger', 'employee', 'admin'].includes(role) ? role : 'passenger';

    if (await User.findOne({ email })) return failure(res, 'Email is already registered', [], 400);

    const user = await User.create({ name, email, password, role: safeRole });
    success(res, { user: user.toSafeJSON(), token: generateToken(user) }, 'Account created', 201);
  } catch (error) { next(error); }
};

exports.login = async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const user = await User.findOne({ email }).populate('assignedStation');
    if (!user || !(await user.comparePassword(req.body.password))) return failure(res, 'Invalid email or password', [], 401);
    if (user.isBlocked) return failure(res, 'This account has been blocked by an administrator', [], 403);
    success(res, { user: user.toSafeJSON(), token: generateToken(user) }, 'Welcome back');
  } catch (error) { next(error); }
};

exports.me = (req, res) => success(res, { user: req.user }, 'Profile loaded');

exports.listEmployees = async (req, res, next) => {
  try {
    success(res, await User.find({ role: 'employee' }).populate('assignedStation').select('-password'));
  } catch (e) { next(e); }
};

exports.updateEmployee = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { name: req.body.name, assignedStation: req.body.assignedStation }, { new: true, runValidators: true }).populate('assignedStation').select('-password');
    success(res, user, 'Employee updated');
  } catch (e) { next(e); }
};

exports.profile = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { $set: { name: req.body.name, phone: req.body.phone, profileImage: req.body.profileImage } }, { new: true, runValidators: true }).populate('assignedStation').select('-password');
    success(res, user, 'Profile updated');
  } catch (e) { next(e); }
};

exports.savedPassengers = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { $push: { savedPassengers: req.body } }, { new: true }).select('savedPassengers');
    success(res, user.savedPassengers, 'Saved passenger added', 201);
  } catch (e) { next(e); }
};

exports.removeSavedPassenger = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { $pull: { savedPassengers: { _id: req.params.id } } }, { new: true }).select('savedPassengers');
    success(res, user.savedPassengers, 'Saved passenger removed');
  } catch (e) { next(e); }
};

exports.listUsers = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.blocked) filter.isBlocked = req.query.blocked === 'true';
    if (req.query.search) {
      const rx = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
    }
    success(res, await User.find(filter).populate('assignedStation').select('-password').sort({ createdAt: -1 }));
  } catch (e) { next(e); }
};

exports.toggleBlocked = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return failure(res, 'User not found', [], 404);
    user.isBlocked = !user.isBlocked;
    await user.save();
    success(res, user.toSafeJSON(), user.isBlocked ? 'User blocked' : 'User unblocked');
  } catch (e) { next(e); }
};
