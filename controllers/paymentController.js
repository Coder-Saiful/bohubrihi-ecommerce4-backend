const {
    PaymentSession
} = require('ssl-commerz-node');
const {
    Cart
} = require('../models/cart');
const { Order } = require('../models/order');
const {
    Payment
} = require('../models/payment');
const {
    Profile
} = require('../models/profile');

module.exports.initPayment = async (req, res) => {
    const payment = new PaymentSession(true, process.env.SSL_COMMERZ_STORE_ID, process.env.SSL_COMMERZ_STORE_PASSWORD);

    const userId = req.user._id;

    const cartItems = await Cart.find({
            user: userId
        })
        .populate('product', 'name');

    const total_amount = cartItems.map(item => item.count * item.price)
        .reduce((a, b) => a + b, 0);

    const tran_id = '_' + Math.random().toString(36).substr(2, 9) + (new Date().getTime());

    const profile = await Profile.findOne({
        user: userId
    });

    const {
        phone,
        address1,
        address2,
        city,
        state,
        postcode,
        country
    } = profile;

    const total_item = cartItems.map(item => item.count)
        .reduce((a, b) => a + b, 0);

    const product_name = cartItems.map(item => item.product.name)
        .join(',');

    // Set the urls
    payment.setUrls({
        success: 'https://bohubrihi-ecommerce4-backend.onrender.com/api/payment/success',
        fail: 'https://bohubrihi-ecommerce4-backend.onrender.com/api/payment/fail',
        cancel: 'https://bohubrihi-ecommerce4-backend.onrender.com/api/payment/cancel',
        ipn: 'https://bohubrihi-ecommerce4-backend.onrender.com/api/payment/ipn'
    });

    // Set order details
    payment.setOrderInfo({
        total_amount: total_amount, // Number field
        currency: "BDT", // Must be three character string
        tran_id: tran_id, // Unique Transaction id
        emi_option: 0, // 1 or 0
        multi_card_name: "internetbank", // Do not Use! If you do not customize the gateway list
    });

    // Set customer info
    payment.setCusInfo({
        name: req.user.name,
        email: req.user.email,
        add1: address1,
        add2: address2,
        city: city,
        state: state,
        postcode: postcode,
        country: country,
        phone: phone,
        fax: phone,
    });

    // Set shipping info
    payment.setShippingInfo({
        method: "Courier", //Shipping method of the order. Example: YES or NO or Courier
        num_item: total_item,
        name: req.user.name,
        add1: address1,
        add2: address2,
        city: city,
        state: state,
        postcode: postcode,
        country: country,
    });

    // Set Product Profile
    payment.setProductInfo({
        product_name: product_name,
        product_category: "General",
        product_profile: "general",
    });

    const response = await payment.paymentInit();

    const order = new Order({
        cartItems: cartItems,
        transaction_id: tran_id,
        address: profile,
        user: userId
    });

    if (response.status === 'SUCCESS') {
        order.sessionKey = response.sessionKey;
        await order.save();
    }
    return res.status(200).send(response);
}

module.exports.ipn = async (req, res) => {
    const payment = new Payment(req.body);
    const tran_id = payment.tran_id;
    if (payment.status === 'VALID') {
        const order = await Order.updateOne({transaction_id: tran_id}, {status: 'Complete'});
        await Cart.deleteMany(order.cartItems);
    } else {
        await Order.deleteOne({transaction_id: tran_id});
    }
    await payment.save();
    return res.status(200).send({message: 'Payment information saved successfully.'});
}

module.exports.paymentSuccess = async (req, res) => {
    res.redirect('http://localhost:3000/payment/success');
}

module.exports.paymentFail = async (req, res) => {
    res.redirect('http://localhost:3000/payment/fail');
}

module.exports.paymentCancel = async (req, res) => {
    res.redirect('http://localhost:3000/payment/cancel');
}
