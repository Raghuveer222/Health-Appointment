const express = require('express');
const router = express.Router();
const { completeConsultation, getPostVisitSummary } = require('../controllers/consultationController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { validateConsultation } = require('../validators/schemas');

router.use(authenticate);

router.post('/:id/consultation', authorize('doctor'), validateConsultation, completeConsultation);
router.get('/:id/summary', getPostVisitSummary);

module.exports = router;
