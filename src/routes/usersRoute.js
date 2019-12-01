const express = require('express');
const router = express.Router();
const controller = require('../controllers/usersController')
const verifyJWT = require('../auth/verifyJWT')

router.get('/', verifyJWT, controller.get)
router.get('/:id', controller.getUser);
router.post('/', controller.createUser);
router.get('/:id/donations', controller.getUserDonations);
router.get('/:id/receptions', controller.getUserReceptions);
router.get('/:id/balances', verifyJWT, controller.getUserBalances);

module.exports = router;