const express = require('express');
const {
    getAdminStats,
    getAllDoctors,
    getAllPatients,
    deleteUser,
    getAllAppointments,
    getAllPayments,
    addDoctor,
    updateDoctor
} = require('../controllers/adminController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/doctors', getAllDoctors);
router.get('/patients', getAllPatients);
router.delete('/users/:id', deleteUser);
router.get('/appointments', getAllAppointments);
router.get('/payments', getAllPayments);
router.post('/doctors', addDoctor);
router.put('/doctors/:id', updateDoctor);

module.exports = router;
