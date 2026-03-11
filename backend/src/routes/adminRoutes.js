const express = require('express');
const router = express.Router();

const { verifyToken, requireRole } = require('../middleware/auth');

// Controllers
const departmentController = require('../controllers/admin/departmentController');
const positionController = require('../controllers/admin/positionController');
const shiftController = require('../controllers/admin/shiftController');
const leaveTypeController = require('../controllers/admin/leaveTypeController');
const userController = require('../controllers/admin/userController');
const timesheetController = require('../controllers/admin/timesheetController');

// All routes here MUST be Admin ONLY
router.use(verifyToken);
router.use(requireRole('Admin'));

// Departments
router.route('/departments')
    .get(departmentController.getDepartments)
    .post(departmentController.createDepartment);
router.route('/departments/:id')
    .put(departmentController.updateDepartment)
    .delete(departmentController.deleteDepartment);

// Positions
router.route('/positions')
    .get(positionController.getPositions)
    .post(positionController.createPosition);
router.route('/positions/:id')
    .put(positionController.updatePosition)
    .delete(positionController.deletePosition);

// Shifts
router.route('/shifts')
    .get(shiftController.getShifts)
    .post(shiftController.createShift);
router.route('/shifts/:id')
    .put(shiftController.updateShift)
    .delete(shiftController.deleteShift);

// Leave Types
router.route('/leaves')
    .get(leaveTypeController.getLeaveTypes)
    .post(leaveTypeController.createLeaveType);
router.route('/leaves/:id')
    .put(leaveTypeController.updateLeaveType)
    .delete(leaveTypeController.deleteLeaveType);

// Users
router.route('/users')
    .get(userController.getUsers)
    .post(userController.createUser);
router.route('/users/:id')
    .put(userController.updateUser)
    .delete(userController.deleteUser);

// Timesheet Aggregation
router.get('/timesheet', timesheetController.getTimesheet);


module.exports = router;
