const express = require('express');
const {
    getDoctorStats,
    getDoctorAppointments,
    getDoctorPatients,
    updateAppointmentStatus
} = require('../controllers/doctorController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('doctor'));

router.get('/stats', getDoctorStats);
router.get('/appointments', getDoctorAppointments);
router.get('/patients', getDoctorPatients);
router.put('/appointments/:id', updateAppointmentStatus);

module.exports = router;
