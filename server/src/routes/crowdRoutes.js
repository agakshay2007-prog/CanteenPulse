const express = require('express');
const router = express.Router();
const crowdController = require('../controllers/crowdController');
const { crowdLimiter } = require('../middleware/rateLimiter');

router.get('/', crowdController.getCrowd);
router.post('/', crowdLimiter, crowdController.submitCrowd);

module.exports = router;
