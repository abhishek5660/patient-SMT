const Prescription = require('../models/Prescription');

// @desc    Get my prescriptions
// @route   GET /api/prescriptions
// @access  Private/Patient
exports.getMyPrescriptions = async (req, res) => {
    try {
        const prescriptions = await Prescription.find({ patient: req.user.id })
            .populate('doctor', 'name specialization')
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: prescriptions.length,
            data: prescriptions
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Add prescription (Doctor only - for testing/future)
// @route   POST /api/prescriptions
// @access  Private/Doctor
exports.addPrescription = async (req, res) => {
    try {
        if (req.user.role !== 'doctor') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const { patientId, medicines, notes } = req.body;

        const prescription = await Prescription.create({
            doctor: req.user.id,
            patient: patientId,
            medicines,
            notes
        });

        res.status(201).json({
            success: true,
            data: prescription
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
