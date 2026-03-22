const express = require('express');
const {
    getMyPrescriptions,
    addPrescription
} = require('../controllers/prescriptionController');

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getMyPrescriptions)
    .post(protect, addPrescription);

module.exports = router;
