const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const router = express.Router();
const controller = require('../controller.js/Usercontroller');



router.get('/', controller.basic)

router.post('/login', controller.login);

router.post('/change-password', controller.changepassword)


router.post('/reset-password',controller.resetpassword)

router.post('/register',controller.register);*
module.exports = router;
