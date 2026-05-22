const Habit = require('../models/Habit');

exports.getHabits = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'userId is required' });
    
    const habits = await Habit.find({ userId });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching habits', error });
  }
};

exports.createHabit = async (req, res) => {
  try {
    const { name, type, color, userId } = req.body;
    const newHabit = new Habit({ name, type, color, userId });
    await newHabit.save();
    res.status(201).json(newHabit);
  } catch (error) {
    res.status(500).json({ message: 'Error creating habit', error });
  }
};

exports.toggleHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.body;
    
    const habit = await Habit.findById(id);
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    
    const dateIndex = habit.completedDates.indexOf(date);
    if (dateIndex > -1) {
      habit.completedDates.splice(dateIndex, 1);
    } else {
      habit.completedDates.push(date);
    }
    
    await habit.save();
    res.json(habit);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling habit', error });
  }
};

exports.deleteHabit = async (req, res) => {
  try {
    const { id } = req.params;
    await Habit.findByIdAndDelete(id);
    res.json({ message: 'Habit deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting habit', error });
  }
};
