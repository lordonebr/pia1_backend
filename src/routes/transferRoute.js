const express = require('express');
const router = express.Router();
const controller = require('../controllers/transferController')
const verifyJWT = require('../auth/verifyJWT')

router.get('/', verifyJWT, controller.get);
router.post('/', verifyJWT, controller.post);

module.exports = router;