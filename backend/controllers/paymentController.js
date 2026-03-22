const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder'
});

// @desc    Get payments for a user
// @route   GET /api/payments
// @access  Private
exports.getPayments = async (req, res) => {
    try {
        let query;
        if (req.user.role === 'patient') {
            query = { patient: req.user.id };
        } else {
            query = {};
        }

        const payments = await Payment.find(query)
            .populate('appointment')
            .populate('invoice')
            .populate('patient', 'name email')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Initiate Razorpay Payment
// @route   POST /api/payments/razorpay/order
// @access  Private
exports.initiateRazorpayPayment = async (req, res) => {
    try {
        const { invoiceId, amount } = req.body;

        const options = {
            amount: amount * 100, // Amount in paise
            currency: "INR",
            receipt: `rcpt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        // Track order in our DB
        await Payment.create({
            invoice: invoiceId,
            patient: req.user.id,
            amount,
            status: 'pending',
            method: 'Razorpay',
            gatewayOrderId: order.id
        });

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        console.error("Razorpay Order Error:", error);
        res.status(500).json({ success: false, message: 'Payment initiation failed' });
    }
};

// @desc    Verify Razorpay Signature and Complete Payment
// @route   POST /api/payments/razorpay/verify
// @access  Private
exports.verifyRazorpayPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder')
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // Payment successful
            const payment = await Payment.findOne({ gatewayOrderId: razorpay_order_id });
            if (!payment) return res.status(404).json({ success: false, message: 'Order record not found' });

            payment.status = 'completed';
            payment.gatewayPaymentId = razorpay_payment_id;
            payment.paidAt = Date.now();
            await payment.save();

            // Update Invoice
            if (payment.invoice) {
                const invoice = await Invoice.findById(payment.invoice);
                if (invoice) {
                    invoice.paidAmount += payment.amount;
                    invoice.status = invoice.paidAmount >= invoice.totalAmount ? 'paid' : 'partial';
                    await invoice.save();
                }
            }

            return res.status(200).json({ success: true, message: "Payment verified successfully" });
        } else {
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }
    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ success: false, message: 'Payment verification failed' });
    }
};

// @desc    Legacy Manual Pay (for Cash/Bank)
// @route   PUT /api/payments/:id/pay
// @access  Private/Admin
exports.payBill = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment record not found' });
        }

        if (payment.patient.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        payment.status = 'completed';
        payment.method = req.body.method || 'Manual';
        payment.transactionId = req.body.transactionId || `MAN-${Date.now()}`;
        payment.paidAt = Date.now();

        await payment.save();

        if (payment.invoice) {
            const invoice = await Invoice.findById(payment.invoice);
            if (invoice) {
                invoice.paidAmount += payment.amount;
                invoice.status = invoice.paidAmount >= invoice.totalAmount ? 'paid' : 'partial';
                await invoice.save();
            }
        }

        res.status(200).json({
            success: true,
            data: payment
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
