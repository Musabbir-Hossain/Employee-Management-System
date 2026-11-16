const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const Employee = require('../models/Employee');
const { resolveEmployeeId } = require('../utils/linkEmployee');

const isAdmin = (req) => req.user.role === 'admin';
const EMP_FIELDS = 'fullName department designation';
const NO_EMPLOYEE = {
  message: 'Your account is not linked to an employee profile yet. Ask an admin to link it.',
  code: 'NO_EMPLOYEE',
};

// ---------- Attendance ----------

const listAttendance = async (req, res, next) => {
  try {
    const { from, to, employee } = req.query;
    const query = {};
    if (isAdmin(req)) {
      if (employee) query.employee = employee;
    } else {
      // Regular users only ever see their own records, whatever the query says.
      const mine = await resolveEmployeeId(req.user);
      if (!mine) return res.json([]);
      query.employee = mine;
    }
    if (from || to) query.date = {};
    if (from) query.date.$gte = new Date(from);
    if (to) query.date.$lte = new Date(`${to}T23:59:59.999`);
    const records = await Attendance.find(query).populate('employee', EMP_FIELDS).sort({ date: -1, createdAt: -1 }).limit(200);
    res.json(records);
  } catch (error) { next(error); }
};

// Admin: record attendance for anyone.
const createAttendance = async (req, res, next) => {
  try {
    const { employee, date, checkIn, checkOut, status, notes } = req.body;
    if (!employee || !date) return res.status(400).json({ message: 'Employee and date are required' });
    const exists = await Employee.findById(employee);
    if (!exists) return res.status(404).json({ message: 'Employee not found' });
    const record = await Attendance.create({ employee, date: new Date(date), checkIn: checkIn || null, checkOut: checkOut || null, status: status || 'Present', notes, createdBy: req.user._id });
    res.status(201).json(await record.populate('employee', EMP_FIELDS));
  } catch (error) { next(error); }
};

// Admin: edit a record. Only these fields can change (no mass-assignment of employee/createdBy).
const updateAttendance = async (req, res, next) => {
  try {
    const patch = {};
    ['date', 'checkIn', 'checkOut', 'status', 'notes'].forEach((key) => {
      if (req.body[key] !== undefined) patch[key] = req.body[key];
    });
    const record = await Attendance.findByIdAndUpdate(req.params.id, patch, { new: true, runValidators: true }).populate('employee', EMP_FIELDS);
    if (!record) return res.status(404).json({ message: 'Attendance record not found' });
    res.json(record);
  } catch (error) { next(error); }
};

const deleteAttendance = async (req, res, next) => {
  try {
    const record = await Attendance.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: 'Attendance record not found' });
    res.json({ message: 'Attendance record deleted' });
  } catch (error) { next(error); }
};

// The server owns the clock. The client only says how far its timezone is from UTC
// (Date#getTimezoneOffset), so "today" and "late" are computed from server time.
const localNow = (req) => {
  const offset = parseInt(req.body?.tzOffset, 10);
  const safe = Number.isFinite(offset) && Math.abs(offset) <= 14 * 60 ? offset : 0;
  const now = new Date();
  const local = new Date(now.getTime() - safe * 60000);
  const dayKey = local.toISOString().slice(0, 10);
  return { now, dayKey, localMinutes: local.getUTCHours() * 60 + local.getUTCMinutes() };
};
const LATE_AFTER_MINUTES = 9 * 60 + 30; // 09:30 local

// User: check in for today.
const checkIn = async (req, res, next) => {
  try {
    const mine = await resolveEmployeeId(req.user);
    if (!mine) return res.status(409).json(NO_EMPLOYEE);
    const { now, dayKey, localMinutes } = localNow(req);
    const date = new Date(`${dayKey}T00:00:00.000Z`); // same shape the admin form stores
    if (await Attendance.exists({ employee: mine, date })) {
      return res.status(400).json({ message: 'You have already checked in today' });
    }
    const record = await Attendance.create({
      employee: mine, date, checkIn: now,
      status: localMinutes > LATE_AFTER_MINUTES ? 'Late' : 'Present',
      createdBy: req.user._id,
    });
    res.status(201).json(await record.populate('employee', EMP_FIELDS));
  } catch (error) { next(error); }
};

// User: check out of today.
const checkOut = async (req, res, next) => {
  try {
    const mine = await resolveEmployeeId(req.user);
    if (!mine) return res.status(409).json(NO_EMPLOYEE);
    const { now, dayKey } = localNow(req);
    const record = await Attendance.findOne({ employee: mine, date: new Date(`${dayKey}T00:00:00.000Z`) });
    if (!record || !record.checkIn) return res.status(400).json({ message: 'Check in first, then you can check out' });
    if (record.checkOut) return res.status(400).json({ message: 'You have already checked out today' });
    record.checkOut = now;
    await record.save();
    res.json(await record.populate('employee', EMP_FIELDS));
  } catch (error) { next(error); }
};

// ---------- Leaves ----------

const listLeaves = async (req, res, next) => {
  try {
    const query = req.query.status ? { status: req.query.status } : {};
    if (!isAdmin(req)) {
      const mine = await resolveEmployeeId(req.user);
      if (!mine) return res.json([]);
      query.employee = mine;
    }
    const records = await LeaveRequest.find(query).populate('employee', EMP_FIELDS).sort({ createdAt: -1 }).limit(200);
    res.json(records);
  } catch (error) { next(error); }
};

const createLeave = async (req, res, next) => {
  try {
    let { employee } = req.body;
    const { leaveType, startDate, endDate, reason } = req.body;
    if (!isAdmin(req)) {
      // Users can only ask for leave for themselves; any employee id in the body is ignored.
      employee = await resolveEmployeeId(req.user);
      if (!employee) return res.status(409).json(NO_EMPLOYEE);
    }
    if (!employee || !leaveType || !startDate || !endDate || !reason) return res.status(400).json({ message: 'Please complete all leave request fields' });
    const exists = await Employee.findById(employee);
    if (!exists) return res.status(404).json({ message: 'Employee not found' });
    const leave = await LeaveRequest.create({ employee, leaveType, startDate, endDate, reason });
    res.status(201).json(await leave.populate('employee', EMP_FIELDS));
  } catch (error) { next(error); }
};

// Admin only (route-guarded).
const reviewLeave = async (req, res, next) => {
  try {
    if (!['Approved', 'Rejected'].includes(req.body.status)) return res.status(400).json({ message: 'Status must be Approved or Rejected' });
    const leave = await LeaveRequest.findByIdAndUpdate(req.params.id, { status: req.body.status, reviewedBy: req.user._id }, { new: true, runValidators: true }).populate('employee', EMP_FIELDS);
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });
    res.json(leave);
  } catch (error) { next(error); }
};

// Admin: delete any. User: withdraw their own request while it is still pending.
const deleteLeave = async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });
    if (!isAdmin(req)) {
      const mine = await resolveEmployeeId(req.user);
      if (!mine || String(leave.employee) !== String(mine)) {
        return res.status(403).json({ message: 'You can only withdraw your own requests' });
      }
      if (leave.status !== 'Pending') {
        return res.status(400).json({ message: 'Only pending requests can be withdrawn' });
      }
    }
    await leave.deleteOne();
    res.json({ message: 'Leave request deleted' });
  } catch (error) { next(error); }
};

// ---------- Dashboards ----------

const getDashboardStats = async (req, res, next) => {
  try {
    const [totalEmployees, departments, attendanceToday, pendingLeaves, recentEmployees, attendanceByStatus] = await Promise.all([
      Employee.countDocuments(),
      Employee.distinct('department'),
      Attendance.countDocuments({ date: { $gte: new Date(new Date().setHours(0,0,0,0)), $lt: new Date(new Date().setHours(24,0,0,0)) } }),
      LeaveRequest.countDocuments({ status: 'Pending' }),
      Employee.find().sort({ createdAt: -1 }).limit(5).select('fullName department designation joiningDate createdAt'),
      Attendance.aggregate([{ $match: { date: { $gte: new Date(new Date().setDate(1)) } } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);
    res.json({ totalEmployees, totalDepartments: departments.filter(Boolean).length, attendanceToday, pendingLeaves, recentEmployees, attendanceByStatus });
  } catch (error) { next(error); }
};

// User dashboard: only data about the signed-in person.
const getMyDashboard = async (req, res, next) => {
  try {
    const mine = await resolveEmployeeId(req.user);
    if (!mine) return res.json({ linked: false, profile: null });
    const tz = parseInt(req.query.tzOffset, 10);
    const safe = Number.isFinite(tz) && Math.abs(tz) <= 14 * 60 ? tz : 0;
    const local = new Date(Date.now() - safe * 60000);
    const dayKey = local.toISOString().slice(0, 10);
    const monthStart = new Date(`${dayKey.slice(0, 7)}-01T00:00:00.000Z`);

    const [profile, today, byStatus, leaveCounts, upcoming] = await Promise.all([
      Employee.findById(mine).select('fullName email department designation joiningDate'),
      Attendance.findOne({ employee: mine, date: new Date(`${dayKey}T00:00:00.000Z`) }),
      Attendance.aggregate([{ $match: { employee: mine, date: { $gte: monthStart } } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      LeaveRequest.aggregate([{ $match: { employee: mine } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      LeaveRequest.find({ employee: mine, status: 'Approved', endDate: { $gte: new Date(`${dayKey}T00:00:00.000Z`) } }).sort({ startDate: 1 }).limit(3),
    ]);
    res.json({ linked: true, profile, today, attendanceByStatus: byStatus, leaveCounts, upcomingLeaves: upcoming });
  } catch (error) { next(error); }
};

module.exports = { listAttendance, createAttendance, updateAttendance, deleteAttendance, checkIn, checkOut, listLeaves, createLeave, reviewLeave, deleteLeave, getDashboardStats, getMyDashboard };
