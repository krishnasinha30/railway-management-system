const Train = require('../models/Train');
const { success, failure } = require('../utils/apiResponse');
const populate = query => query.populate('source destination routeStops.station');
const buildFilter = query => {
	const filter = {};
	if (query.station) filter.$or = [{ source: query.station }, { destination: query.station }, { 'routeStops.station': query.station }];
	if (query.status) filter.status = query.status;
	if (query.category) filter.category = query.category;
	if (query.source) filter.source = query.source;
	if (query.destination) filter.destination = query.destination;
	return filter;
};
exports.list = async (req, res, next) => { try { success(res, await populate(Train.find(buildFilter(req.query)).sort({ scheduledDeparture: 1 }))); } catch (e) { next(e); } };
exports.search = async (req, res, next) => { try { const query = req.query.query || ''; const rx = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); const filter = buildFilter(req.query); filter.$and = [{ $or: [{ trainNumber: rx }, { trainName: rx }] }]; success(res, await populate(Train.find(filter))); } catch (e) { next(e); } };
exports.get = async (req, res, next) => { try { const train = await populate(Train.findById(req.params.id)); if (!train) return failure(res, 'Train not found', [], 404); success(res, train); } catch (e) { next(e); } };
exports.create = async (req, res, next) => { try { success(res, await Train.create(req.body), 'Train created', 201); } catch (e) { next(e); } };
exports.update = async (req, res, next) => { try { const current = await Train.findById(req.params.id); if (!current) return failure(res, 'Train not found', [], 404); if (req.user.role === 'employee') { const stationId = req.user.assignedStation?._id?.toString(); const servesStation = [current.source, current.destination, ...(current.routeStops || []).map(stop => stop.station)].some(id => id.toString() === stationId); if (!servesStation) return failure(res, 'You can only update trains serving your assigned station', [], 403); } const allowed = req.user.role === 'employee' ? ['platformNumber', 'status', 'currentStatus', 'delayMinutes', 'delayReason', 'estimatedArrival', 'estimatedDeparture'] : Object.keys(req.body); const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key))); if (updates.status) updates.currentStatus = updates.status; if (updates.currentStatus) updates.status = updates.currentStatus; const train = await populate(Train.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })); req.app.get('io').emit('trainUpdated', train); success(res, train, 'Train operations updated'); } catch (e) { next(e); } };
exports.remove = async (req, res, next) => { try { if (!await Train.findByIdAndDelete(req.params.id)) return failure(res, 'Train not found', [], 404); success(res, null, 'Train deleted'); } catch (e) { next(e); } };
exports.favourite = async (req, res, next) => { try { const user = req.user; const id = req.params.id; user.favourites = user.favourites.some(item => item.toString() === id) ? user.favourites.filter(item => item.toString() !== id) : [...user.favourites, id]; await user.save(); success(res, user.favourites, 'Favourites updated'); } catch (e) { next(e); } };
