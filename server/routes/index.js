'use strict';

const express = require('express');
const router = express.Router();

router.get('/', function (req, res, next) {
    res.redirect('/mhbg/index.html');
    //res.render('index', { title: '满好访客通' });
});
//router.get('/', require('./welcome'));
router.get('/login', require('./login'));
router.get('/user', require('./user'));
router.all('/tunnel', require('./tunnel'));

module.exports = router;