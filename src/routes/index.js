const express = require('express');
const router = express.Router();
const verifyJWT = require('../auth/verifyJWT');

/* GET home page. */
router.get('/', verifyJWT, (req, res, next) =>  {
    console.log("teste");
    res.status(200).send({
        title: "Coins API",
        version: "1.0.0"
    });
});

module.exports = router;