export type HabitType = 'good' | 'bad';

export interface Habit {
  id: string;
  name: string;
  type: HabitType;
  completedDates: string[]; // ISO date strings
  createdAt: string;
  color: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
  isGuest?: boolean;
}

export interface HabitStats {
  streak: number;
  totalCompleted: number;
  completionRate: number;
}
