const User = require('../models/User');

// @desc    Get a user profile (for public view of doctors)
// @route   GET /api/users/:id
// @access  Private
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all doctors
// @route   GET /api/users/doctors
// @access  Private
exports.getDoctors = async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' }).select('-password');

        res.status(200).json({
            success: true,
            count: doctors.length,
            data: doctors
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Basic Info
        if (req.body.name !== undefined) user.name = req.body.name;
        if (req.body.email !== undefined) user.email = req.body.email;
        if (req.body.phone !== undefined) user.phone = req.body.phone;
        if (req.body.address !== undefined) user.address = req.body.address;
        if (req.body.gender !== undefined) user.gender = req.body.gender;

        // Number fields
        if (req.body.age !== undefined) {
            user.age = req.body.age === '' ? null : Number(req.body.age);
        }

        if (req.body.experience !== undefined) {
            user.experience = req.body.experience === '' ? null : Number(req.body.experience);
        }

        if (req.body.consultationFee !== undefined) {
            user.consultationFee = req.body.consultationFee === '' ? null : Number(req.body.consultationFee);
        }

        // Doctor Strings
        if (req.body.specialization !== undefined) user.specialization = req.body.specialization;
        if (req.body.qualifications !== undefined) user.qualifications = req.body.qualifications;

        // Patient Strings
        if (req.body.bloodGroup !== undefined) user.bloodGroup = req.body.bloodGroup;
        if (req.body.dob !== undefined) user.dob = req.body.dob;

        // Handle nested object
        if (req.body['emergencyContact[name]'] !== undefined || req.body['emergencyContact[phone]'] !== undefined) {
            user.emergencyContact = {
                name: req.body['emergencyContact[name]'] || user.emergencyContact?.name || '',
                phone: req.body['emergencyContact[phone]'] || user.emergencyContact?.phone || '',
                relation: user.emergencyContact?.relation || ''
            };
        } else if (req.body.emergencyContact) {
            user.emergencyContact = req.body.emergencyContact;
        }

        // Handle profile image if uploaded or deleted
        if (req.body.deleteProfilePicture === 'true') {
            user.profileImage = '';
        } else if (req.file) {
            user.profileImage = `/uploads/${req.file.filename}`;
        }


        // Handle password change if provided (and not empty)
        if (req.body.password && req.body.password.trim() !== '') {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        // Do not return password
        const userResponse = updatedUser.toObject();
        delete userResponse.password;

        res.status(200).json({
            success: true,
            data: userResponse
        });
    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
