import React from 'react';
import { useHabits } from '../context/HabitContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { Trophy, Activity, Calendar, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const StatsGrid: React.FC = () => {
  const { habits } = useHabits();

  const totalCompleted = habits.reduce((acc, h) => acc + h.completedDates.length, 0);
  const completionRate = habits.length > 0 
    ? Math.round((totalCompleted / (habits.length * 30)) * 100) 
    : 0;

  const activeStreaks = habits.map(h => {
    let streak = 0;
    const sorted = [...h.completedDates].sort((a, b) => b.localeCompare(a));
    for (let i = 0; i < sorted.length; i++) {
      const dateStr = format(subDays(new Date(), streak), 'yyyy-MM-dd');
      if (h.completedDates.includes(dateStr)) streak++;
      else break;
    }
    return streak;
  });

  const maxStreak = Math.max(0, ...activeStreaks);

  const stats = [
    { label: 'Total Completions', value: totalCompleted, icon: <Calendar className="text-blue-500" />, color: 'blue' },
    { label: 'Avg Completion Rate', value: `${completionRate}%`, icon: <Activity className="text-green-500" />, color: 'green' },
    { label: 'Best Streak', value: `${maxStreak} Days`, icon: <Zap className="text-yellow-500" />, color: 'yellow' },
    { label: 'Active Habits', value: habits.length, icon: <Trophy className="text-purple-500" />, color: 'purple' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="p-4 sm:p-6 rounded-2xl border bg-card/50 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="scale-75 sm:scale-100">{stat.icon}</div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">{stat.label}</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-display">{stat.value}</div>
        </motion.div>
      ))}
    </div>
  );
};

export const PerformanceReport: React.FC = () => {
  const { habits } = useHabits();

  const data = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const completedCount = habits.filter(h => h.completedDates.includes(dateStr)).length;
    return {
      name: format(date, 'EEE'),
      completed: completedCount,
    };
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-8 rounded-3xl border bg-card shadow-sm overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5 hidden sm:block">
        <Activity size={120} />
      </div>
      
      <div className="mb-6 md:mb-8">
        <h3 className="text-xl sm:text-2xl font-bold font-display">Performance Report</h3>
        <p className="text-sm sm:text-base text-muted-foreground">Activity levels over the last 7 days</p>
      </div>

      <div className="h-[300px] md:h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 500, fill: 'hsl(var(--muted-foreground))' }}
              dy={10}
            />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                borderColor: 'hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                fontSize: '12px'
              }} 
            />
            <Area 
              type="monotone" 
              dataKey="completed" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorCompleted)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

const StatsDashboard: React.FC = () => {
  return (
    <div className="space-y-6 md:space-y-8">
      <StatsGrid />
      <PerformanceReport />
    </div>
  );
};

export default StatsDashboard;
