const mongoose = require('mongoose');
const User = require('../models/User');
const Employee = require('../models/Employee');
const userPayload = require('../utils/userPayload');

const ROLES = ['admin', 'user'];
const withEmployee = (q) => q.populate('employee', 'fullName department designation email');

// Never let the system end up with zero admins.
const isLastAdmin = async (user) => user.role === 'admin' && (await User.countDocuments({ role: 'admin' })) <= 1;

// @route GET /api/users   (admin)
const listUsers = async (req, res, next) => {
  try {
    const users = await withEmployee(User.find().sort({ createdAt: -1 }).limit(500));
    res.json(users.map((u) => ({ ...userPayload(u), employee: u.employee, createdAt: u.createdAt })));
  } catch (error) { next(error); }
};

// @route POST /api/users   (admin) — create an account with a chosen role
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role = 'user' } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Please provide name, email and password' });
    if (!ROLES.includes(role)) return res.status(400).json({ message: 'Role must be admin or user' });
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) return res.status(400).json({ message: 'User already exists with this email' });
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password, role });
    const match = await Employee.findOne({ email: normalizedEmail }).select('_id');
    if (match && !(await User.exists({ employee: match._id }))) { user.employee = match._id; await user.save(); }
    res.status(201).json(userPayload(user));
  } catch (error) { next(error); }
};

// @route PATCH /api/users/:id   (admin) — change role and/or linked employee
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { role, employee } = req.body;

    if (role !== undefined) {
      if (!ROLES.includes(role)) return res.status(400).json({ message: 'Role must be admin or user' });
      if (role !== user.role && role === 'user' && (await isLastAdmin(user))) {
        return res.status(400).json({ message: 'You cannot remove the last admin' });
      }
      user.role = role;
    }

    if (employee !== undefined) {
      if (employee === null || employee === '') {
        user.employee = null;
      } else {
        if (!mongoose.isValidObjectId(employee) || !(await Employee.exists({ _id: employee }))) {
          return res.status(404).json({ message: 'Employee not found' });
        }
        if (await User.exists({ employee, _id: { $ne: user._id } })) {
          return res.status(400).json({ message: 'That employee is already linked to another account' });
        }
        user.employee = employee;
      }
    }

    await user.save();
    const fresh = await withEmployee(User.findById(user._id));
    res.json({ ...userPayload(fresh), employee: fresh.employee, createdAt: fresh.createdAt });
  } catch (error) { next(error); }
};

// @route DELETE /api/users/:id   (admin)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (String(user._id) === String(req.user._id)) return res.status(400).json({ message: 'You cannot delete your own account' });
    if (await isLastAdmin(user)) return res.status(400).json({ message: 'You cannot delete the last admin' });
    await user.deleteOne();
    res.json({ message: 'User deleted', id: req.params.id });
  } catch (error) { next(error); }
};

module.exports = { listUsers, createUser, updateUser, deleteUser };
