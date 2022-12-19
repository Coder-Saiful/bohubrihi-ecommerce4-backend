const express = require('express');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');

module.exports = (app) => {
    app.use(compression());
    app.use(cors());
    app.use(express.json());
    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    }
}