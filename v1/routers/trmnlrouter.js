const express = require('express')
const router = express.Router();

const trmnlController = require('../controllers/trmnlController');
const trmnlInstallSuccessController = require('../controllers/trmnlInstallSuccessController');

router.get('/', trmnlController);

//router.get('/installation_success', trmnlInstallSuccessController)

module.exports = router