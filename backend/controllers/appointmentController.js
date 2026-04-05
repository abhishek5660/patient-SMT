const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

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

        // Notify Doctor
        const patient = await User.findById(req.user.id);
        await createNotification(
            doctorId,
            'New Appointment Request',
            `Patient ${patient.name} has requested an appointment on ${new Date(appointmentDate).toLocaleDateString()}.`,
            'info'
        );

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

// @desc    Update appointment status/details
// @route   PUT /api/appointments/:id
// @access  Private
exports.updateAppointmentStatus = async (req, res) => {
    try {
        let appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        const isUserPatient = req.user.role === 'patient';
        const isUserDoctor = req.user.role === 'doctor';
        const isUserAdmin = req.user.role === 'admin';

        // Ownership checks
        if (isUserPatient && appointment.patient.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to update this appointment' });
        }
        if (isUserDoctor && appointment.doctor.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to update this appointment' });
        }

        // Data restriction for patients
        if (isUserPatient) {
            const allowedFields = ['status', 'appointmentDate', 'reason'];
            const updates = Object.keys(req.body);
            const isValidOperation = updates.every((update) => allowedFields.includes(update));

            if (!isValidOperation) {
                return res.status(400).json({ success: false, message: 'Invalid updates for patient role' });
            }

            // Patients can only set status to 'cancelled'
            if (req.body.status && req.body.status !== 'cancelled') {
                return res.status(400).json({ success: false, message: 'Patients can only set status to cancelled' });
            }
        }

        const oldStatus = appointment.status;
        appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('doctor', 'name').populate('patient', 'name');

        // Notify relevant parties
        if (req.body.status && req.body.status !== oldStatus) {
            if (isUserDoctor || isUserAdmin) {
                // Notify Patient about status change
                await createNotification(
                    appointment.patient._id,
                    `Appointment ${req.body.status.charAt(0).toUpperCase() + req.body.status.slice(1)}`,
                    `Your appointment with Dr. ${appointment.doctor.name} has been ${req.body.status}.`,
                    req.body.status === 'approved' ? 'success' : 'warning'
                );
            } else if (isUserPatient && req.body.status === 'cancelled') {
                // Notify Doctor about patient cancellation
                await createNotification(
                    appointment.doctor._id,
                    'Appointment Cancelled',
                    `Patient ${appointment.patient.name} has cancelled their appointment scheduled for ${new Date(appointment.appointmentDate).toLocaleDateString()}.`,
                    'warning'
                );
            }
        }

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
