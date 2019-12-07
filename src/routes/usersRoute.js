const express = require('express');
const router = express.Router();
const controller = require('../controllers/usersController')
const verifyJWT = require('../auth/verifyJWT')

// serviços que necessitam login
router.get('/balances', verifyJWT, controller.getUserBalances);

router.get('/', verifyJWT, controller.get)
router.get('/:id', controller.getUser);
router.post('/', controller.createUser);
router.get('/:id/donations', controller.getUserDonations);
router.get('/:id/receptions', controller.getUserReceptions);
router.post('/:id/awards', verifyJWT, controller.postAwards);

module.exports = router;