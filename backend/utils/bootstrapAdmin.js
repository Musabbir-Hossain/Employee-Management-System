const User = require('../models/User');

// One-time safety net. Before roles existed every account had full power, so if the
// database has users but no admin, promote the oldest account. Does nothing otherwise.
const bootstrapAdmin = async () => {
  if (await User.exists({ role: 'admin' })) return;
  const oldest = await User.findOne().sort({ createdAt: 1 });
  if (!oldest) return;
  oldest.role = 'admin';
  await oldest.save();
  console.log(`No admin found. Promoted oldest account (${oldest.email}) to admin.`);
};

module.exports = bootstrapAdmin;
