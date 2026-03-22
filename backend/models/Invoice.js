const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    patient: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    doctor: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    appointment: {
        type: mongoose.Schema.ObjectId,
        ref: 'Appointment'
    },
    items: [{
        description: { type: String, required: true },
        amount: { type: Number, required: true }
    }],
    subtotal: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'partial', 'paid', 'cancelled', 'refunded'],
        default: 'pending'
    },
    dueDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate subtotals before saving
invoiceSchema.pre('save', function (next) {
    this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);
    // Let's assume a default 5% tax if not provided manually
    if (this.tax === 0) {
        this.tax = this.subtotal * 0.05;
    }
    this.totalAmount = this.subtotal + this.tax;
    next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
