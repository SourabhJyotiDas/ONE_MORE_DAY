import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Habit, User } from '../types';
import { format } from 'date-fns';
import api from '../utils/api';

interface HabitContextType {
  habits: Habit[];
  addHabit: (name: string, type: 'good' | 'bad', color: string) => Promise<void>;
  removeHabit: (id: string) => Promise<void>;
  reorderHabits: (newHabits: Habit[]) => void;
  toggleHabitComplete: (id: string, date: Date) => Promise<void>;
  user: User | null;
  login: (user: User) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  loading: boolean;
  error: string | null;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('omd_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('omd_theme');
    return (saved as 'light' | 'dark') || 'light';
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch habits when user changes
  useEffect(() => {
    const fetchHabits = async () => {
      if (!user) {
        setHabits([]);
        return;
      }

      if (user.isGuest) {
        const savedHabits = localStorage.getItem('omd_guest_habits');
        setHabits(savedHabits ? JSON.parse(savedHabits) : []);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/habits?userId=${user.id}`);
        const transformed = response.data.map((h: any) => ({
          ...h,
          id: h._id
        }));
        setHabits(transformed);
      } catch (err: any) {
        console.error('Error fetching habits:', err);
        setError(err.response?.data?.message || 'Failed to fetch habits');
      } finally {
        setLoading(false);
      }
    };
    fetchHabits();
  }, [user]);

  // Save guest habits whenever they change
  useEffect(() => {
    if (user?.isGuest) {
      localStorage.setItem('omd_guest_habits', JSON.stringify(habits));
    }
  }, [habits, user]);

  useEffect(() => {
    localStorage.setItem('omd_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('omd_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const addHabit = async (name: string, type: 'good' | 'bad', color: string) => {
    if (!user) return;
    
    if (user.isGuest) {
      const newHabit: Habit = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        type,
        color,
        completedDates: [],
        createdAt: new Date().toISOString(),
      };
      setHabits([...habits, newHabit]);
      return;
    }

    try {
      const response = await api.post('/habits', {
        name,
        type,
        color,
        userId: user.id
      });
      const newHabit = { ...response.data, id: response.data._id };
      setHabits([...habits, newHabit]);
    } catch (err) {
      console.error('Error adding habit:', err);
    }
  };

  const removeHabit = async (id: string) => {
    if (user?.isGuest) {
      setHabits(habits.filter(h => h.id !== id));
      return;
    }

    try {
      await api.delete(`/habits/${id}`);
      setHabits(habits.filter(h => h.id !== id));
    } catch (err) {
      console.error('Error removing habit:', err);
    }
  };

  const toggleHabitComplete = async (id: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');

    if (user?.isGuest) {
      setHabits(habits.map(h => {
        if (h.id === id) {
          const completedDates = [...h.completedDates];
          const index = completedDates.indexOf(dateStr);
          if (index > -1) {
            completedDates.splice(index, 1);
          } else {
            completedDates.push(dateStr);
          }
          return { ...h, completedDates };
        }
        return h;
      }));
      return;
    }

    try {
      const response = await api.patch(`/habits/${id}/toggle`, { date: dateStr });
      const updatedHabit = { ...response.data, id: response.data._id };
      setHabits(habits.map(h => h.id === id ? updatedHabit : h));
    } catch (err) {
      console.error('Error toggling habit:', err);
    }
  };

  const reorderHabits = async (newHabits: Habit[]) => {
    setHabits(newHabits);
    
    if (user && !user.isGuest) {
      try {
        await api.patch('/habits/reorder', {
          habits: newHabits.map((h, index) => ({ id: h.id, order: index }))
        });
      } catch (err) {
        console.error('Error persisting habit order:', err);
      }
    }
  };

  const login = async (userData: User) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/users/login', {
        googleId: userData.id,
        name: userData.name,
        email: userData.email,
        picture: userData.picture
      });
      
      const loggedInUser: User = {
        id: response.data.googleId,
        name: response.data.name,
        email: response.data.email,
        picture: response.data.picture,
        isGuest: false
      };
      setUser(loggedInUser);
    } catch (err: any) {
      console.error('Error during login:', err);
      setError(err.response?.data?.message || err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginAsGuest = () => {
    const guestUser: User = {
      id: 'guest',
      name: 'Guest User',
      email: 'guest@example.com',
      picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest',
      isGuest: true
    };
    setUser(guestUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('omd_user');
    if (user?.isGuest) {
      localStorage.removeItem('omd_guest_habits');
    }
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <HabitContext.Provider value={{
      habits, addHabit, removeHabit, reorderHabits, toggleHabitComplete,
      user, login, loginAsGuest, logout, theme, toggleTheme, loading, error
    }}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
};
