const express = require('express');
const router = express.Router();
const crowdController = require('../controllers/crowdController');

router.get('/', crowdController.getCrowd);
router.post('/', crowdController.submitCrowd);

module.exports = router;

