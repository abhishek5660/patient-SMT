const Invoice = require('../models/Invoice');

// @desc    Get all invoices for logged in patient
// @route   GET /api/invoices
// @access  Private
exports.getInvoices = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'patient') {
            query = { patient: req.user.id };
        } else if (req.user.role === 'doctor') {
            query = { doctor: req.user.id };
        }

        const invoices = await Invoice.find(query)
            .populate('patient', 'name email')
            .populate('doctor', 'name specialization')
            .populate('appointment')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: invoices.length,
            data: invoices
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create an invoice
// @route   POST /api/invoices
// @access  Private/Admin/Doctor
exports.createInvoice = async (req, res) => {
    try {
        const { patientId, appointmentId, items, dueDate } = req.body;

        const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const invoice = await Invoice.create({
            invoiceNumber,
            patient: patientId,
            doctor: req.user.role === 'doctor' ? req.user.id : req.body.doctorId,
            appointment: appointmentId,
            items,
            dueDate,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            data: invoice
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Private
exports.getInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate('patient', 'name email phone address')
            .populate('doctor', 'name specialization')
            .populate('appointment');

        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }

        res.status(200).json({
            success: true,
            data: invoice
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update invoice status
// @route   PUT /api/invoices/:id/status
// @access  Private/Admin/Doctor
exports.updateInvoiceStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }

        // Only explicitly process 'paid' string matching the database enum.
        invoice.status = status;
        if (status.toLowerCase() === 'paid') {
            invoice.paidAmount = invoice.totalAmount;
        } else if (status.toLowerCase() === 'pending') {
            invoice.paidAmount = 0;
        }

        await invoice.save();

        res.status(200).json({
            success: true,
            data: invoice
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
