const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getFilterOptions,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Everyone signed in can browse the directory (users get a reduced view); only admins change it.
router.route('/').get(getEmployees).post(authorize('admin'), createEmployee);
router.get('/meta/filters', getFilterOptions); // must be before /:id
router.route('/:id')
  .get(authorize('admin'), getEmployeeById)
  .put(authorize('admin'), updateEmployee)
  .delete(authorize('admin'), deleteEmployee);

module.exports = router;
