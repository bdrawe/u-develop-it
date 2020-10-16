const { Router } = require('express');
const express = require('express');
const router = express.Router();

router.use(require('./partyRoutes'));

router.use(require('./votersRoutes'))

router.use(require('./candidatesRoutes'));

module.exports = router;
