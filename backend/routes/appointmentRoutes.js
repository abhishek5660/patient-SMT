const express = require('express');
const {
    bookAppointment,
    getAppointments,
    updateAppointmentStatus,
    deleteAppointment
} = require('../controllers/appointmentController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('patient'), bookAppointment)
    .get(protect, getAppointments);

router.route('/:id')
    .put(protect, authorize('doctor', 'admin'), updateAppointmentStatus)
    .delete(protect, authorize('admin'), deleteAppointment);

module.exports = router;
