const router = require('express').Router();
const {
    initPayment,
    ipn
} = require('../controllers/paymentController');
const authorize = require('../middlewares/authorize');

router.get('/', authorize, initPayment);

router.post('/ipn', ipn);

module.exports = router;
