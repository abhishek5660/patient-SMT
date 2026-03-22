const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Prescription = require('../models/Prescription');
const Payment = require('../models/Payment');

// @desc    Get Doctor Dashboard Stats
// @route   GET /api/doctor/stats
// @access  Private/Doctor
exports.getDoctorStats = async (req, res) => {
    try {
        const doctorId = req.user.id;

        const totalAppointments = await Appointment.countDocuments({ doctor: doctorId });
        const pendingAppointments = await Appointment.countDocuments({ doctor: doctorId, status: 'scheduled' });
        const completedAppointments = await Appointment.countDocuments({ doctor: doctorId, status: 'completed' });

        // Calculate Total Earnings from Payments linked to this doctor's appointments
        // Note: In a real app, we might need more complex aggregation if payments aren't directly linked to doctor ID but via appointment
        // Assuming we can find payments for appointments booked with this doctor
        const appointments = await Appointment.find({ doctor: doctorId }).select('_id');
        const appointmentIds = appointments.map(a => a._id);

        const payments = await Payment.find({
            appointment: { $in: appointmentIds },
            status: 'completed'
        });

        const totalEarnings = payments.reduce((acc, curr) => acc + curr.amount, 0);

        // Get unique patients count
        const uniquePatients = await Appointment.distinct('patient', { doctor: doctorId });

        res.status(200).json({
            success: true,
            data: {
                totalPatients: uniquePatients.length,
                totalAppointments,
                pendingAppointments,
                completedAppointments,
                totalEarnings
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get Doctor's Appointments with filters
// @route   GET /api/doctor/appointments
// @access  Private/Doctor
exports.getDoctorAppointments = async (req, res) => {
    try {
        const { status, date } = req.query;
        let query = { doctor: req.user.id };

        if (status && status !== 'all') {
            query.status = status;
        }

        if (date) {
            // Match specific date (ignoring time)
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            query.appointmentDate = { $gte: startDate, $lt: endDate };
        }

        const appointments = await Appointment.find(query)
            .populate('patient', 'name age gender profileImage')
            .sort({ appointmentDate: 1 });

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

// @desc    Get Doctor's Patients
// @route   GET /api/doctor/patients
// @access  Private/Doctor
exports.getDoctorPatients = async (req, res) => {
    try {
        // Find all appointments for this doctor and populate patient details
        const appointments = await Appointment.find({ doctor: req.user.id }).populate('patient', 'name email phone age gender address profileImage');

        // Extract unique patients manually
        const patientsMap = new Map();
        appointments.forEach(appt => {
            if (appt.patient && !patientsMap.has(appt.patient._id.toString())) {
                patientsMap.set(appt.patient._id.toString(), appt.patient);
            }
        });

        const patients = Array.from(patientsMap.values());

        res.status(200).json({
            success: true,
            count: patients.length,
            data: patients
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update Appointment Status
// @route   PUT /api/doctor/appointments/:id
// @access  Private/Doctor
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        if (appointment.doctor.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        appointment.status = status;
        await appointment.save();

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
