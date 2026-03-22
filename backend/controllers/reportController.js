const Report = require('../models/Report');

// @desc    Upload a report
// @route   POST /api/reports
// @access  Private/Patient
exports.uploadReport = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const { title, reportType } = req.body;
        const fileUrl = `/uploads/${req.file.filename}`;

        const report = await Report.create({
            patient: req.user.id,
            title,
            fileUrl,
            reportType
        });

        res.status(201).json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get my reports
// @route   GET /api/reports
// @access  Private/Patient
exports.getMyReports = async (req, res) => {
    try {
        const reports = await Report.find({ patient: req.user.id }).sort({ uploadedAt: -1 });

        res.status(200).json({
            success: true,
            count: reports.length,
            data: reports
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete a report
// @route   DELETE /api/reports/:id
// @access  Private/Patient
exports.deleteReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        // Verify ownership
        if (report.patient.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        await report.deleteOne();

        res.status(200).json({ success: true, message: 'Report removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
