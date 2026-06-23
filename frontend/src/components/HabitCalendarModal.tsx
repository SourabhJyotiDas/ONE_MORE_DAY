import React from 'react';
import Calendar from 'react-calendar';
import type { Habit } from '../types';
import { useHabits } from '../context/HabitContext';
import { format, isAfter, startOfDay, subDays } from 'date-fns';
import { X, Calendar as CalendarIcon, Award, Flame, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// Helper to convert HEX to RGB for box-shadow support
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 59, g: 130, b: 246 }; // Default to Tailwind blue-500
}

interface HabitCalendarModalProps {
  habit: Habit;
  onClose: () => void;
}

const HabitCalendarModal: React.FC<HabitCalendarModalProps> = ({ habit, onClose }) => {
  const { toggleHabitComplete } = useHabits();

  const rgb = hexToRgb(habit.color);
  const habitColorStyles = {
    '--habit-color': habit.color,
    '--habit-color-rgb-alpha': `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`,
  } as React.CSSProperties;

  // Calculate Streak
  const calculateStreak = () => {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const checkDate = subDays(today, i);
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      
      if (habit.completedDates.includes(dateStr)) {
        streak++;
      } else {
        if (i === 0) continue;
        break;
      }
    }
    return streak;
  };

  const handleDateClick = async (date: Date) => {
    // Prevent toggling future dates
    if (isAfter(startOfDay(date), startOfDay(new Date()))) {
      return;
    }
    await toggleHabitComplete(habit.id, date);
  };

  const isTileDisabled = ({ date }: { date: Date }) => {
    // Disable future dates
    return isAfter(startOfDay(date), startOfDay(new Date()));
  };

  const getTileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return '';
    const dateStr = format(date, 'yyyy-MM-dd');
    if (habit.completedDates.includes(dateStr)) {
      return 'habit-calendar-tile-completed';
    }
    return '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 max-h-[90vh]"
        style={habitColorStyles}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: habit.color }}
            >
              <CalendarIcon size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                  habit.type === 'good' ? "badge-positive" : "badge-negative"
                }`}>
                  {habit.type === 'good' ? 'Positive' : 'Break Habit'}
                </span>
              </div>
              <h2 className="text-xl font-black font-display tracking-tight text-foreground">
                {habit.name}
              </h2>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content Wrapper */}
        <div className="overflow-y-auto flex-1 scrollbar-hide">
          {/* Stats Summary */}
          <div className="grid grid-cols-3 border-b border-border bg-secondary/20 divide-x divide-border">
            <div className="p-4 text-center">
              <div className="flex justify-center text-amber-500 mb-1">
                <Flame size={20} strokeWidth={2.5} />
              </div>
              <div className="text-lg font-black font-display leading-tight">{calculateStreak()}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Current Streak</div>
            </div>
            
            <div className="p-4 text-center">
              <div className="flex justify-center text-emerald-500 mb-1">
                <CheckCircle size={20} />
              </div>
              <div className="text-lg font-black font-display leading-tight">{habit.completedDates.length}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Logged</div>
            </div>

            <div className="p-4 text-center">
              <div className="flex justify-center text-primary mb-1">
                <Award size={20} />
              </div>
              <div className="text-lg font-black font-display leading-tight">
                {habit.completedDates.length > 0 
                  ? `${Math.min(100, Math.round((habit.completedDates.length / 30) * 100))}%`
                  : '0%'
                }
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">30d Target</div>
            </div>
          </div>

          {/* Calendar Wrapper */}
          <div className="p-6">
            <Calendar
              onClickDay={handleDateClick}
              tileClassName={getTileClassName}
              tileDisabled={isTileDisabled}
              className="habit-tracker-calendar"
              maxDate={new Date()}
              minDetail="decade"
            />
          </div>

          {/* Instructions */}
          <div className="p-4 bg-secondary/30 border-t border-border text-center text-xs text-muted-foreground">
            Click on any past or current date to log or remove your habit entry.
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HabitCalendarModal;
