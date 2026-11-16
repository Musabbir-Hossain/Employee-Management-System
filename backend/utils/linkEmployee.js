const Employee = require('../models/Employee');
const User = require('../models/User');

// Returns the Employee _id for a user. If the account is not linked yet, tries to
// link it by matching the account email to an employee email (and saves the link).
const resolveEmployeeId = async (user) => {
  if (user.employee) return user.employee._id || user.employee;
  const match = await Employee.findOne({ email: user.email }).select('_id');
  if (!match) return null;
  const taken = await User.exists({ employee: match._id, _id: { $ne: user._id } });
  if (taken) return null;
  await User.updateOne({ _id: user._id }, { employee: match._id });
  user.employee = match._id;
  return match._id;
};

module.exports = { resolveEmployeeId };
