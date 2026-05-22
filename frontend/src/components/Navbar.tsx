import React from 'react';
import { Moon, Sun, LogOut, User as UserIcon } from 'lucide-react';
import { useHabits } from '../context/HabitContext';
import { motion } from 'framer-motion';

const Navbar: React.FC = () => {
  const { theme, toggleTheme, user, logout } = useHabits();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg sm:text-xl">1</span>
          </div>
          <h1 className="text-lg sm:text-xl font-display font-bold tracking-tight">ONE MORE DAY</h1>
        </motion.div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-secondary transition-colors cursor-pointer"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {user ? (
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l">
              <img 
                src={user.picture} 
                alt={user.name} 
                referrerPolicy="no-referrer"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border"
              />
              <div className="hidden md:block">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition-colors cursor-pointer"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <UserIcon size={18} className="text-muted-foreground" />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
