const express = require('express')
const router = express.Router();


router.get('/', require('../controllers/statuscontroller'));

module.exports = router