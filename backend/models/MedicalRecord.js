const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
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
    diagnosis: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    attachments: [{
        fileName: String,
        fileUrl: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    vitalSigns: {
        bloodPressure: String,
        heartRate: String,
        temperature: String,
        weight: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
