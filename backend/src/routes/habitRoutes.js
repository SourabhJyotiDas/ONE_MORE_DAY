const express = require('express');
const { getHabits, createHabit, toggleHabit, deleteHabit, reorderHabits, updateHabit } = require('../controllers/habitController');

const router = express.Router();

router.get('/', getHabits);
router.post('/', createHabit);
router.patch('/:id/toggle', toggleHabit);
router.patch('/reorder', reorderHabits);
router.patch('/:id', updateHabit);
router.delete('/:id', deleteHabit);

module.exports = router;
