const express = require('express');
const {
    getPayments,
    payBill,
    initiateRazorpayPayment,
    verifyRazorpayPayment
} = require('../controllers/paymentController');

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getPayments);

router.post('/razorpay/order', initiateRazorpayPayment);
router.post('/razorpay/verify', verifyRazorpayPayment);

router.route('/:id/pay').put(payBill);

module.exports = router;
