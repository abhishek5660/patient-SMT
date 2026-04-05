const MedicalRecord = require('../models/MedicalRecord');
const { createNotification } = require('./notificationController');
const User = require('../models/User');

// @desc    Get medical records for a patient
// @route   GET /api/medical-records/:patientId
// @access  Private (Doctor or Patient themselves)
exports.getMedicalRecords = async (req, res) => {
    try {
        // Check if user is authorized to view these records
        if (req.user.role === 'patient' && req.user.id !== req.params.patientId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const records = await MedicalRecord.find({ patient: req.params.patientId })
            .populate('doctor', 'name');

        res.status(200).json({
            success: true,
            count: records.length,
            data: records
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Add a medical record
// @route   POST /api/medical-records
// @access  Private/Doctor
exports.addMedicalRecord = async (req, res) => {
    try {
        // Only doctors can add records
        if (req.user.role !== 'doctor') {
            return res.status(403).json({ success: false, message: 'Not authorized to add medical records' });
        }

        const { patientId, diagnosis, description, vitalSigns } = req.body;

        const record = await MedicalRecord.create({
            patient: patientId,
            doctor: req.user.id,
            diagnosis,
            description,
            vitalSigns
        });

        // Notify Patient
        const doctor = await User.findById(req.user.id);
        await createNotification(
            patientId,
            'Medical Record Updated',
            `Dr. ${doctor.name} has added a new medical record with diagnosis: ${diagnosis}.`,
            'info'
        );

        res.status(201).json({
            success: true,
            data: record
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
