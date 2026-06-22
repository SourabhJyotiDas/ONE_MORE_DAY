import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import type { Habit } from '../types';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

interface EditHabitModalProps {
  habit: Habit;
  onClose: () => void;
}

const EditHabitModal: React.FC<EditHabitModalProps> = ({ habit, onClose }) => {
  const { editHabit } = useHabits();
  const [name, setName] = useState(habit.name);
  const [type, setType] = useState<'good' | 'bad'>(habit.type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await editHabit(habit.id, name, type, habit.color || '#3b82f6');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-md cursor-default"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl z-10"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded-full hover:bg-secondary transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl sm:text-3xl font-black font-display mb-6 tracking-tight">Edit Habit</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div>
            <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
              Habit Name
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Habit name..."
              className="w-full bg-secondary/50 border border-border rounded-2xl px-5 py-3.5 sm:px-6 sm:py-4 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {/* Type Picker */}
          <div>
            <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 block">
              Choose Type
            </label>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setType('good')}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all font-bold text-sm sm:text-base cursor-pointer ${
                  type === 'good' 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-transparent bg-secondary/50 text-muted-foreground hover:bg-secondary'
                }`}
              >
                Positive
              </button>
              <button
                type="button"
                onClick={() => setType('bad')}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all font-bold text-sm sm:text-base cursor-pointer ${
                  type === 'bad' 
                    ? 'border-destructive bg-destructive/5 text-destructive' 
                    : 'border-transparent bg-secondary/50 text-muted-foreground hover:bg-secondary'
                }`}
              >
                Break Habit
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-3.5 rounded-2xl font-bold bg-secondary hover:bg-secondary/80 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-3.5 rounded-2xl font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-lg shadow-primary/20 cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditHabitModal;
