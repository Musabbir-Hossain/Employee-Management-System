const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { listUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');

router.use(protect, authorize('admin'));
router.route('/').get(listUsers).post(createUser);
router.route('/:id').patch(updateUser).delete(deleteUser);

module.exports = router;
