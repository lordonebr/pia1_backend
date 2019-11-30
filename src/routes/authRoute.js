const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController')

router.post('/', controller.post);
router.get('/signup', controller.signup);

module.exports = router;