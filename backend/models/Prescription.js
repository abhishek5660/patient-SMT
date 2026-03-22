const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    doctor: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    medicines: [
        {
            name: {
                type: String,
                required: true
            },
            dosage: {
                type: String, // e.g., '500mg'
                required: true
            },
            frequency: {
                type: String, // e.g., '1-0-1'
                required: true
            },
            duration: {
                type: String, // e.g., '5 Days'
                required: true
            }
        }
    ],
    notes: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
