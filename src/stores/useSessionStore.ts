import { create } from "zustand";

type Goal = { id?: string; title: string; description?: string };

type SessionState = {
  goal?: Goal;
  sessionId?: string;
  streak: number;
  setGoal: (goal: Goal) => void;
  setSession: (sessionId: string) => void;
  setStreak: (streak: number) => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  goal: undefined,
  sessionId: undefined,
  streak: 0,
  setGoal: (goal) => set({ goal }),
  setSession: (sessionId) => set({ sessionId }),
  setStreak: (streak) => set({ streak }),
}));

