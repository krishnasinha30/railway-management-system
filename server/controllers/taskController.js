const EmployeeTask = require('../models/EmployeeTask');
const { success, failure } = require('../utils/apiResponse');
exports.myTasks = async (req, res, next) => { try { success(res, await EmployeeTask.find({ employee: req.user._id }).populate('station').sort({ dueDate: 1 })); } catch (e) { next(e); } };
exports.create = async (req, res, next) => { try { success(res, await EmployeeTask.create(req.body), 'Task assigned', 201); } catch (e) { next(e); } };
exports.update = async (req, res, next) => { try { const task = await EmployeeTask.findOneAndUpdate({ _id: req.params.id, employee: req.user._id }, { status: req.body.status }, { new: true, runValidators: true }); if (!task) return failure(res, 'Task not found or not assigned to you', [], 404); success(res, task, 'Task updated'); } catch (e) { next(e); } };
