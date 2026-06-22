import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Habit } from '../types';
import { format, subDays, isAfter, startOfDay } from 'date-fns';
import { X, BarChart3, Award, Flame, CheckCircle } from 'lucide-react';
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

interface HabitGraphModalProps {
  habit: Habit;
  onClose: () => void;
}

type Timeframe = 7 | 30 | 90;

const HabitGraphModal: React.FC<HabitGraphModalProps> = ({ habit, onClose }) => {
  const [timeframe, setTimeframe] = useState<Timeframe>(30);

  const rgb = hexToRgb(habit.color);
  const habitColorStyles = {
    '--habit-color': habit.color,
    '--habit-color-rgb-alpha': `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`,
  } as React.CSSProperties;

  // Calculate stats for the selected timeframe
  const calculateTimeframeStats = (days: number) => {
    const today = new Date();
    let completedCount = 0;
    let maxStreak = 0;
    let currentStreak = 0;
    
    // Scan chronological sequence to calculate streak and completions
    for (let i = days - 1; i >= 0; i--) {
      const checkDate = subDays(today, i);
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      
      if (habit.completedDates.includes(dateStr)) {
        completedCount++;
        currentStreak++;
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
        }
      } else {
        currentStreak = 0;
      }
    }
    
    const completionRate = Math.round((completedCount / days) * 100);
    
    return {
      completedCount,
      completionRate,
      maxStreak
    };
  };

  const stats = calculateTimeframeStats(timeframe);

  // Generate chart data representing daily progress (binary 0 or 1)
  const generateChartData = (days: number) => {
    const today = new Date();
    const chartData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const isCompleted = habit.completedDates.includes(dateStr);
      
      chartData.push({
        dateStr,
        label: days === 7 
          ? format(date, 'EEE') 
          : format(date, 'MMM d'),
        completed: isCompleted ? 1 : 0,
      });
    }

    return chartData;
  };

  const chartData = generateChartData(timeframe);

  // Interval for X-Axis tick rendering to prevent overlap
  const getXAxisInterval = () => {
    if (timeframe === 7) return 0;
    if (timeframe === 30) return 5;
    return 14;
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
        className="relative w-full max-w-xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10"
        style={habitColorStyles}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: habit.color }}
            >
              <BarChart3 size={20} />
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
                {habit.name} History
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

        {/* Timeframe Selection Tabs */}
        <div className="px-6 pt-4 flex gap-2 bg-secondary/10 border-b border-border">
          {([7, 30, 90] as Timeframe[]).map((days) => (
            <button
              key={days}
              onClick={() => setTimeframe(days)}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                timeframe === days 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Last {days} Days
            </button>
          ))}
        </div>

        {/* Stats Summary Grid */}
        <div className="grid grid-cols-3 border-b border-border bg-secondary/20 divide-x divide-border">
          <div className="p-4 text-center">
            <div className="flex justify-center text-amber-500 mb-1">
              <Flame size={20} strokeWidth={2.5} />
            </div>
            <div className="text-lg font-black font-display leading-tight">{stats.maxStreak}d</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Max Streak</div>
          </div>
          
          <div className="p-4 text-center">
            <div className="flex justify-center text-emerald-500 mb-1">
              <CheckCircle size={20} />
            </div>
            <div className="text-lg font-black font-display leading-tight">{stats.completedCount}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Completions</div>
          </div>

          <div className="p-4 text-center">
            <div className="flex justify-center text-primary mb-1">
              <Award size={20} />
            </div>
            <div className="text-lg font-black font-display leading-tight">
              {stats.completionRate}%
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Completion Rate</div>
          </div>
        </div>

        {/* Graph Display Area */}
        <div className="p-6 h-[250px] sm:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="habitColorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={habit.color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={habit.color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }}
                interval={getXAxisInterval()}
                dy={8}
              />
              <YAxis 
                domain={[0, 1.15]}
                ticks={[0, 1]}
                tickFormatter={(value) => (value === 1 ? 'Done' : 'Miss')}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }}
                dx={-8}
              />
              <Tooltip 
                formatter={(value: any) => [value === 1 ? 'Done' : 'Missed', 'Status']}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                  fontWeight: 600
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="completed" 
                stroke={habit.color} 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#habitColorGrad)" 
                dot={timeframe === 90 ? false : { r: 3.5, strokeWidth: 1, fill: 'hsl(var(--card))' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Banner */}
        <div className="p-4 bg-secondary/30 border-t border-border text-center text-xs text-muted-foreground">
          Showing daily completion status (Done / Miss) over the selected duration.
        </div>
      </motion.div>
    </div>
  );
};

export default HabitGraphModal;
