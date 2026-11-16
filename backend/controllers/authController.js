const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const userPayload = require('../utils/userPayload');
const { resolveEmployeeId } = require('../utils/linkEmployee');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Public sign-up can only ever create a regular user. Admins are made by admins (or seed).
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password, role: 'user' });
    await resolveEmployeeId(user);

    res.status(201).json({
      ...userPayload(user),
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    await resolveEmployeeId(user);

    res.status(200).json({
      ...userPayload(user),
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    await resolveEmployeeId(req.user);
    res.status(200).json(userPayload(req.user));
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, getMe };
