import React, { useState } from 'react';
import type { Habit } from '../types';
import { useHabits } from '../context/HabitContext';
import { format, subDays, isSameDay } from 'date-fns';
import { Check, Trash2, TrendingUp, GripVertical, AlertTriangle, Calendar, BarChart3, MoreVertical, Pencil } from 'lucide-react';
import { motion, AnimatePresence, DragControls } from 'framer-motion';
import HabitCalendarModal from './HabitCalendarModal';
import HabitGraphModal from './HabitGraphModal';
import EditHabitModal from './EditHabitModal';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface HabitCardProps {
  habit: Habit;
  dragControls?: DragControls;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, dragControls }) => {
  const { toggleHabitComplete, removeHabit } = useHabits();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));

  const calculateStreak = () => {
    let streak = 0;
    const today = new Date();
    
    // Check from today backwards
    for (let i = 0; i < 365; i++) {
      const checkDate = subDays(today, i);
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      
      if (habit.completedDates.includes(dateStr)) {
        streak++;
      } else {
        // If it's today and not completed, don't break the streak yet, 
        // as the user might still complete it.
        if (i === 0) {
          continue;
        }
        break;
      }
    }
    return streak;
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await removeHabit(habit.id);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('Error deleting habit:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div
        className="group relative p-4 sm:p-6 rounded-2xl border bg-card hover:shadow-xl transition-all duration-300"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-start gap-3">
            <div 
              onPointerDown={(e) => dragControls?.start(e)}
              className={cn(
                "mt-1 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors",
                dragControls ? "cursor-grab active:cursor-grabbing" : "cursor-default"
              )}
            >
              <GripVertical size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
               <span className={cn(
                 "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                 habit.type === 'good' ? "badge-positive" : "badge-negative"
               )}>
                 {habit.type === 'good' ? 'Positive' : 'Break Habit'}
               </span>
             </div>
            <h3 className="text-lg sm:text-xl font-bold font-display group-hover:text-primary transition-colors line-clamp-1">
              {habit.name}
            </h3>
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              title="More actions"
            >
              <MoreVertical size={20} />
            </button>

            {isMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 z-50 w-48 bg-card border border-border rounded-2xl p-1.5 shadow-xl flex flex-col gap-0.5 animate-in fade-in duration-200">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setShowGraph(true);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all cursor-pointer w-full text-left"
                  >
                    <BarChart3 size={16} />
                    View Graph
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setShowCalendar(true);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all cursor-pointer w-full text-left"
                  >
                    <Calendar size={16} />
                    View Calendar
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setShowEdit(true);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all cursor-pointer w-full text-left"
                  >
                    <Pencil size={16} />
                    Edit Habit
                  </button>
                  <div className="h-px bg-border my-1" />
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-bold text-destructive hover:bg-destructive/10 rounded-xl transition-all cursor-pointer w-full text-left"
                  >
                    <Trash2 size={16} />
                    Delete Habit
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-6">
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            {last7Days.map((date) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const isCompleted = habit.completedDates.includes(dateStr);
              const isToday = isSameDay(date, new Date());
              
              return (
                <div key={dateStr} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">
                      {format(date, 'EEE').charAt(0)}
                    </span>
                    <span className="text-[9px] font-medium text-muted-foreground/70 leading-none mt-0.5">
                      {format(date, 'd')}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleHabitComplete(habit.id, date)}
                    className={cn(
                      "w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 flex items-center justify-center transition-all duration-300 cursor-pointer",
                      isCompleted 
                        ? "bg-primary border-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20" 
                        : "hover:border-primary/50",
                      isToday && !isCompleted && "border-dashed border-primary"
                    )}
                  >
                    {isCompleted && <Check className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />}
                  </button>
                </div>
              );
            })}
          </div>
          
          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0">
            <div className="flex items-center gap-1 text-primary">
              <TrendingUp size={16} />
              <span className="text-xl sm:text-2xl font-black font-display">{calculateStreak()}</span>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
              Day Streak
            </span>
          </div>
        </div>

        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((calculateStreak() / 30) * 100, 100)}%` }}
            className="h-full bg-primary"
          />
        </div>
      </div>

      <AnimatePresence>
        {showCalendar && (
          <HabitCalendarModal habit={habit} onClose={() => setShowCalendar(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGraph && (
          <HabitGraphModal habit={habit} onClose={() => setShowGraph(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEdit && (
          <EditHabitModal habit={habit} onClose={() => setShowEdit(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setShowDeleteConfirm(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-card border rounded-3xl p-6 sm:p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              
              <h2 className="text-2xl font-black font-display mb-2">Delete Habit?</h2>
              <p className="text-muted-foreground mb-8 text-sm">
                Are you sure you want to delete <span className="font-bold text-foreground">"{habit.name}"</span>? 
                This action cannot be undone and all progress will be lost.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  disabled={isDeleting}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="py-3.5 rounded-2xl font-bold bg-secondary hover:bg-secondary/80 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="py-3.5 rounded-2xl font-bold bg-destructive text-destructive-foreground hover:opacity-90 transition-all shadow-lg shadow-destructive/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-destructive-foreground border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HabitCard;
