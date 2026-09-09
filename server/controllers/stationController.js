const Station = require('../models/Station');
const { success, failure } = require('../utils/apiResponse');
exports.list = async (req, res, next) => { try { success(res, await Station.find().sort({ name: 1 })); } catch (e) { next(e); } };
exports.get = async (req, res, next) => { try { const station = await Station.findById(req.params.id); if (!station) return failure(res, 'Station not found', [], 404); success(res, station); } catch (e) { next(e); } };
exports.create = async (req, res, next) => { try { success(res, await Station.create(req.body), 'Station created', 201); } catch (e) { next(e); } };
exports.update = async (req, res, next) => { try { success(res, await Station.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }), 'Station updated'); } catch (e) { next(e); } };
exports.remove = async (req, res, next) => { try { await Station.findByIdAndDelete(req.params.id); success(res, null, 'Station deleted'); } catch (e) { next(e); } };
