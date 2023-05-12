const router = require('express').Router();
const {
    initPayment,
    ipn,
    paymentSuccess,
    paymentFail,
    paymentCancel
} = require('../controllers/paymentController');
const authorize = require('../middlewares/authorize');

router.get('/', authorize, initPayment);

router.post('/ipn', ipn);

router.post('/success', paymentSuccess);

router.post('/fail', paymentFail);

router.post('/cancel', paymentCancel);

module.exports = router;