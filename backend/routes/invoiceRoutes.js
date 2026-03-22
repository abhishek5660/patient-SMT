const express = require('express');
const router = express.Router();
const {
    getInvoices,
    createInvoice,
    getInvoice,
    updateInvoiceStatus
} = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getInvoices)
    .post(authorize('admin', 'doctor'), createInvoice);

router.route('/:id/status')
    .put(authorize('admin', 'doctor'), updateInvoiceStatus);

router.route('/:id')
    .get(getInvoice);

module.exports = router;
