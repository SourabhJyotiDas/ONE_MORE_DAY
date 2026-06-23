import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, Outlet } from 'react-router-dom';
import { HabitProvider, useHabits } from './context/HabitContext';
import Navbar from './components/Navbar';
import HabitCard from './components/HabitCard';
import HabitForm from './components/HabitForm';
import { StatsGrid, PerformanceReport } from './components/StatsDashboard';
import LoginScreen from './components/LoginScreen';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { LayoutGrid, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import type { Habit } from './types';

const HabitCardItem = ({ habit }: { habit: Habit }) => {
  const dragControls = useDragControls();

  return (
    <Reorder.Item 
      as="div"
      key={habit.id} 
      value={habit}
      dragListener={false}
      dragControls={dragControls}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <HabitCard habit={habit} dragControls={dragControls} />
    </Reorder.Item>
  );
};

const HabitsView: React.FC = () => {
  const { habits, loading, reorderHabits } = useHabits();

  if (loading) {
    return (
      <motion.div
        key="loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex items-center justify-center py-20"
      >
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </motion.div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h3 className="text-2xl md:text-3xl font-black font-display tracking-tight">Daily Habits</h3>
        <div className="flex gap-2">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest bg-secondary px-3 py-1 rounded-full">
            <div className="w-2 h-2 rounded-full bg-primary" />
            {habits.length} Habits
          </span>
        </div>
      </div>

      {habits.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-12 rounded-3xl border border-dashed text-center"
        >
          <p className="text-muted-foreground mb-4">You haven't added any habits yet.</p>
          <p className="font-bold text-primary">Click the + button to get started.</p>
        </motion.div>
      ) : (
        <Reorder.Group 
          as="div"
          axis="y" 
          values={habits} 
          onReorder={reorderHabits}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {habits.map(habit => (
              <HabitCardItem key={habit.id} habit={habit} />
            ))}
          </AnimatePresence>
        </Reorder.Group>
      )}
    </motion.section>
  );
};

const DashboardView: React.FC = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-8">
        <h3 className="text-2xl md:text-3xl font-black font-display tracking-tight mb-2">Progress Report</h3>
        <p className="text-muted-foreground">Your habit tracking summary at a glance.</p>
      </div>
      <StatsGrid />
    </motion.section>
  );
};

const PerformanceView: React.FC = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-8">
        <h3 className="text-2xl md:text-3xl font-black font-display tracking-tight mb-2">Performance Analysis</h3>
        <p className="text-muted-foreground">Detailed view of your consistency over time.</p>
      </div>
      <PerformanceReport />
    </motion.section>
  );
};

const DashboardLayout: React.FC = () => {
  const location = useLocation();

  const tabs = [
    { id: 'habits', label: 'Habits', icon: <LayoutGrid size={18} />, path: '/habits' },
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={18} />, path: '/dashboard' },
    { id: 'performance', label: 'Performance', icon: <PieChartIcon size={18} />, path: '/performance' },
  ] as const;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        <header className="mb-10 md:mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-5xl md:text-6xl font-black font-display tracking-tighter mb-4"
          >
            Your Progress
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-muted-foreground"
          >
            Don't break the chain. One more day.
          </motion.p>
        </header>

        {/* Tab Navigation (Desktop Only) */}
        <div className="hidden sm:flex bg-secondary/50 p-1.5 rounded-2xl mb-12 w-fit relative">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <Link
                key={tab.id}
                to={tab.path}
                className={`relative flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer z-10 ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabBackground"
                    className="absolute inset-0 bg-card rounded-xl shadow-sm -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {tab.icon}
                {tab.label}
              </Link>
            );
          })}
        </div>

        <div className="relative">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-card/85 backdrop-blur-md border-t border-border px-6 py-2.5 flex justify-around items-center z-40 shadow-2xl overflow-hidden">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isActive 
                  ? 'text-primary scale-105' 
                  : 'text-muted-foreground'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-colors relative ${isActive ? 'bg-primary/10' : ''}`}>
                {React.cloneElement(tab.icon, { size: 20 })}
              </div>
              <span className="text-[10px] font-bold tracking-tight">{tab.label}</span>
            </Link>
          );
        })}
      </div>

      <HabitForm />
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user } = useHabits();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Navigate to="/habits" replace />} />
        <Route path="/habits" element={<HabitsView />} />
        <Route path="/dashboard" element={<DashboardView />} />
        <Route path="/performance" element={<PerformanceView />} />
        <Route path="*" element={<Navigate to="/habits" replace />} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <HabitProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </HabitProvider>
  );
};

export default App;
