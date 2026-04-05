const Appointment = require('../models/Appointment');
const User = require('../models/User');

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private/Patient
exports.bookAppointment = async (req, res) => {
    try {
        const { doctorId, appointmentDate, reason } = req.body;

        const doctor = await User.findById(doctorId);
        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }

        const appointment = await Appointment.create({
            patient: req.user.id,
            doctor: doctorId,
            appointmentDate,
            reason
        });

        res.status(201).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all appointments for a user (doctor or patient)
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res) => {
    try {
        let query;

        if (req.user.role === 'patient') {
            query = { patient: req.user.id };
        } else if (req.user.role === 'doctor') {
            query = { doctor: req.user.id };
        } else {
            // Admin sees all
            query = {};
        }

        const appointments = await Appointment.find(query)
            .populate('patient', 'name email')
            .populate('doctor', 'name specialization');

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id
// @access  Private/Doctor/Admin
exports.updateAppointmentStatus = async (req, res) => {
    try {
        let appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // Verify ownership (if doctor)
        if (req.user.role === 'doctor' && appointment.doctor.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to update this appointment' });
        }

        appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private/Admin
exports.deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // Only admin can delete appointments for now
        if (req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this appointment' });
        }

        await appointment.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
