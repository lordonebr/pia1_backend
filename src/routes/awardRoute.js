const express = require('express');
const router = express.Router();
const controller = require('../controllers/awardController')
const verifyJWT = require('../auth/verifyJWT')

router.get('/', verifyJWT, controller.get);
router.post('/', controller.post);

module.exports = router;