import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name: string; email: string }) => void;
  updateProfilePicture: (imageUrl: string) => void;
  removeProfilePicture: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (email: string, password: string) => {
    // TODO: Implement actual authentication
    const mockUser: User = {
      id: '1',
      name: 'John Doe',
      email,
      role: 'user',
      profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    };
    set({ user: mockUser, isAuthenticated: true });
  },
  signUp: async (data) => {
    // TODO: Implement actual sign up
    const mockUser: User = {
      id: '1',
      name: data.name,
      email: data.email,
      role: 'user',
      profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    };
    set({ user: mockUser, isAuthenticated: true });
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
  updateProfile: (data) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    }));
  },
  updateProfilePicture: (imageUrl) => {
    set((state) => ({
      user: state.user ? { ...state.user, profilePicture: imageUrl } : null,
    }));
  },
  removeProfilePicture: () => {
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
          }
        : null,
    }));
  },
}));