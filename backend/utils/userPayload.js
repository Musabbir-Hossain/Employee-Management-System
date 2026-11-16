// Single place that decides what the client is told about a user.
const userPayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role || 'user',
  employee: user.employee || null,
});

module.exports = userPayload;
