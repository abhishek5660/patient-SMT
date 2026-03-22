const express = require('express');
const {
    uploadReport,
    getMyReports,
    deleteReport
} = require('../controllers/reportController');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, upload.single('file'), uploadReport)
    .get(protect, getMyReports);

router.route('/:id')
    .delete(protect, deleteReport);

module.exports = router;
