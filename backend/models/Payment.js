const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    invoice: {
        type: mongoose.Schema.ObjectId,
        ref: 'Invoice',
    },
    appointment: {
        type: mongoose.Schema.ObjectId,
        ref: 'Appointment',
    },
    patient: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    method: {
        type: String, // 'Razorpay', 'Cash', 'Card', 'UPI'
    },
    gatewayOrderId: {
        type: String
    },
    gatewayPaymentId: {
        type: String
    },
    transactionId: {
        type: String
    },
    paidAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Payment', paymentSchema);
