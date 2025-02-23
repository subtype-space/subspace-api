const express = require('express')
const router = express.Router();

const statusController = require('../controllers/statuscontroller');

router.get('/', statusController);
router.get('/status')

module.exports = router