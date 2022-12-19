const { User, validate } = require('../models/user');
const bcrypt = require('bcrypt');
const _ = require('lodash');

module.exports.signUp = async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error) {
            error.details.forEach(err => {
                err[err.context.key] = err.message;
                delete err['message'];
                delete err['path'];
                delete err['type'];
                delete err['context'];
            });
            const [name, email, password] = error.details;
            const Error = {...name, ...email, ...password};
            return res.status(400).send(Error);
        } else {
            let user = await User.findOne({ email: req.body.email });
            if (user) {
                return res.status(400).send({ message: "User already registered!" });
            } else {    
                user = new User(_.pick(req.body, ["name", "email", "password"]));

                user.password = await bcrypt.hash(req.body.password, 10);

                const token = user.genJWT();

                const result = await user.save();

                return res.status(201).send({
                    message: "Registration Successfully!",
                    token: token,
                    data: _.pick(result, ["_id", "name", "email"])
                });
            }
        }
    } catch (error) {
        return res.status(400).send({ message: "Registration failed! Please try again." });
    }
}

module.exports.signIn = async (req, res) => {
    try {
        let user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).send({ message: "Email does not exists!" });
        } else {
            const validUser = await bcrypt.compare(req.body.password, user.password);
            if (!validUser) {
                return res.status(400).send({ message: "Password does not match!" });
            } else {
                const token = user.genJWT();

                return res.status(200).send({
                    message: "Login Successfully!",
                    token: token,
                    data: _.pick(user, ["_id", "name", "email"])
                });
            }
        }
    } catch (error) {
        return res.status(400).send({ message: "Login failed! Please try again." });
    }
}

