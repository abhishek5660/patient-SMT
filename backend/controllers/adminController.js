const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');
const Report = require('../models/Report');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
    try {
        const totalPatients = await User.countDocuments({ role: 'patient' });
        const totalDoctors = await User.countDocuments({ role: 'doctor' });
        const totalAppointments = await Appointment.countDocuments();
        const pendingPayments = await Payment.countDocuments({ status: 'pending' });

        // Calculate Revenue
        const payments = await Payment.find({ status: 'completed' });
        const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

        // Recent Activity (Example: Last 5 appointments)
        const recentActivity = await Appointment.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('patient', 'name')
            .populate('doctor', 'name');

        res.status(200).json({
            success: true,
            data: {
                totalPatients,
                totalDoctors,
                totalAppointments,
                totalRevenue,
                pendingPayments,
                recentActivity
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get All Doctors
// @route   GET /api/admin/doctors
// @access  Private/Admin
exports.getAllDoctors = async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' }).select('-password');
        res.status(200).json({ success: true, count: doctors.length, data: doctors });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get All Patients
// @route   GET /api/admin/patients
// @access  Private/Admin
exports.getAllPatients = async (req, res) => {
    try {
        const patients = await User.find({ role: 'patient' }).select('-password');
        res.status(200).json({ success: true, count: patients.length, data: patients });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete User (Doctor/Patient)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Prevent deleting other admins (safety check)
        if (user.role === 'admin') {
            return res.status(400).json({ success: false, message: 'Cannot delete admin' });
        }

        await user.deleteOne();
        res.status(200).json({ success: true, message: 'User deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get All Appointments
// @route   GET /api/admin/appointments
// @access  Private/Admin
exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('patient', 'name email')
            .populate('doctor', 'name specialization')
            .sort({ appointmentDate: -1 });

        res.status(200).json({ success: true, count: appointments.length, data: appointments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get All Payments
// @route   GET /api/admin/payments
// @access  Private/Admin
exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('patient', 'name')
            .populate({
                path: 'appointment',
                populate: { path: 'doctor', select: 'name' }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: payments.length, data: payments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Add New Doctor
// @route   POST /api/admin/doctors
// @access  Private/Admin
exports.addDoctor = async (req, res) => {
    try {
        const { name, email, password, specialization, experience, consultationFee } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Create user
        user = await User.create({
            name,
            email,
            password, // Will be hashed by pre-save hook in User model
            role: 'doctor',
            specialization,
            experience,
            consultationFee
        });

        res.status(201).json({ success: true, data: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
