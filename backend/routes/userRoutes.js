const express = require('express');
const {
    getUserProfile,
    getDoctors,
    updateUserProfile
} = require('../controllers/userController');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

router.route('/doctors').get(protect, getDoctors);
router.route('/profile').put(protect, upload.single('profileImage'), updateUserProfile);
router.route('/:id').get(protect, getUserProfile);

module.exports = router;
