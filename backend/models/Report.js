const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    reportType: {
        type: String, // e.g., 'Blood Test', 'X-Ray'
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Report', reportSchema);
