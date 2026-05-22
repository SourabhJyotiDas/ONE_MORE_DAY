import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HabitForm: React.FC = () => {
  const { addHabit } = useHabits();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'good' | 'bad'>('good');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addHabit(name, type, '#3b82f6');
    setName('');
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 cursor-pointer"
      >
        <Plus size={32} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm cursor-default"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-card border rounded-3xl p-6 sm:p-8 shadow-2xl"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl sm:text-3xl font-black font-display mb-6 sm:mb-8">New Habit</h2>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                    Habit Name
                  </label>
                  <input
                    autoFocus
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={type === 'good' ? "e.g. Read 20 mins" : "e.g. No smoking"}
                    className="w-full bg-secondary/50 border-none rounded-2xl px-5 py-3.5 sm:px-6 sm:py-4 text-base sm:text-lg focus:ring-2 ring-primary transition-all"
                  />
                </div>

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
                      Add Habit
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
                      Remove bad habit
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground py-3.5 sm:py-4 rounded-2xl font-bold text-base sm:text-lg hover:opacity-90 transition-all shadow-lg shadow-primary/20 cursor-pointer"
                >
                  Create
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HabitForm;
