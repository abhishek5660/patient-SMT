const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['patient', 'doctor', 'admin'],
        default: 'patient'
    },
    isApproved: { // For doctors
        type: Boolean,
        default: false
    },
    // Patient specific fields
    bloodGroup: {
        type: String
    },
    dob: {
        type: Date
    },
    phone: {
        type: String
    },
    age: {
        type: Number
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    address: {
        type: String
    },
    profileImage: {
        type: String, // URL/Path to image
        default: 'default-profile.png'
    },
    emergencyContact: {
        name: String,
        phone: String,
        relation: String
    },
    // Doctor Specific Fields
    specialization: {
        type: String
    },
    experience: {
        type: Number // Years of experience
    },
    qualifications: {
        type: String
    },
    consultationFee: {
        type: Number
    },
    availableSlots: [{
        day: String,
        startTime: String,
        endTime: String
    }],
    availabilitySchedule: {
        type: [String], // e.g., ["Mon: 10am-2pm", "Wed: 4pm-8pm"]
        default: []
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
