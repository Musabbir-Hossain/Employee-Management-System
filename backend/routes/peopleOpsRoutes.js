const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const c = require('../controllers/peopleOpsController');
const admin = authorize('admin');
router.use(protect);

router.get('/dashboard', admin, c.getDashboardStats);
router.get('/my-dashboard', c.getMyDashboard);

// Attendance: everyone reads (users are scoped to themselves in the controller);
// users self check-in/out; only admins create/edit/delete records by hand.
router.route('/attendance').get(c.listAttendance).post(admin, c.createAttendance);
router.post('/attendance/check-in', c.checkIn);
router.post('/attendance/check-out', c.checkOut);
router.route('/attendance/:id').put(admin, c.updateAttendance).delete(admin, c.deleteAttendance);

// Leaves: users request/see/withdraw their own; admins review everything.
router.route('/leaves').get(c.listLeaves).post(c.createLeave);
router.patch('/leaves/:id/review', admin, c.reviewLeave);
router.delete('/leaves/:id', c.deleteLeave);
module.exports = router;
