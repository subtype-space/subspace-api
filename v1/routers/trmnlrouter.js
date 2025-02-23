const express = require('express')
const router = express.Router();

const trmnlcontroller = require('../controllers/trmnlcontroller');

router.get('/', trmnlcontroller);

module.exports = router