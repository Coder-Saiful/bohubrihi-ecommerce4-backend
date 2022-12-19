const router = require('express').Router();
const { signUp, signIn } = require('../controllers/userController');
const authorize = require('../middlewares/authorize');
const admin = require('../middlewares/admin');

router.route('/signup')
    .post(signUp);

router.route('/signin')
    .post(signIn);

router.get('/dashboard', authorize, (req, res) => { 
    res.send("<h1>This is dashboard...</h1>");
});

router.get('/admin/dashboard', [authorize, admin], (req, res) => { 
    res.send("<h1>This is admin dashboard...</h1>");
});

module.exports = router;
