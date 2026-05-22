const express = require('express');
const { getHabits, createHabit, toggleHabit, deleteHabit } = require('../controllers/habitController');

const router = express.Router();

router.get('/', getHabits);
router.post('/', createHabit);
router.patch('/:id/toggle', toggleHabit);
router.delete('/:id', deleteHabit);

module.exports = router;
