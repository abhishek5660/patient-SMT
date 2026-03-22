const express = require('express');
const {
    getMedicalRecords,
    addMedicalRecord
} = require('../controllers/medicalRecordController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('doctor'), addMedicalRecord);

router.route('/:patientId')
    .get(protect, getMedicalRecords);

module.exports = router;
