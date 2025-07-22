
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/lib/types';
import { applyRetentionPolicy, getActiveUser, getUsers } from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password?: string) => Promise<boolean>;
  logout: () => void;
  signup: (username: string, password?: string, role?: 'admin' | 'viewer') => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Apply data retention policy on app load
    applyRetentionPolicy();

    const activeUser = getActiveUser();
    setUser(activeUser);
    setIsLoading(false);
  }, []);

  const login = async (username: string, password?: string): Promise<boolean> => {
    const users = getUsers();
    const foundUser = users.find(u => u.username === username && u.password === password);

    if (foundUser) {
      const userToStore = { id: foundUser.id, username: foundUser.username, role: foundUser.role };
      localStorage.setItem('activeUser', JSON.stringify(userToStore));
      setUser(userToStore);
      return true;
    }
    return false;
  };
  
  const signup = async (username: string, password?: string, role?: 'admin' | 'viewer'): Promise<boolean> => {
    const users = getUsers();
    
    if (users.find(u => u.username === username)) {
      console.error("Signup failed: Username already exists.");
      return false; 
    }

    // First user is always an admin, otherwise use provided role or default to viewer
    const assignedRole = users.length === 0 ? 'admin' : (role || 'viewer');
    
    const newUser: User = {
        id: `user-${Date.now()}`,
        username,
        password,
        role: assignedRole,
    };
    
    const updatedUsers = [...users, newUser];
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Automatically log in the new user only if it's the first user signing up
    if (users.length === 0) {
        const userToStore = { id: newUser.id, username: newUser.username, role: newUser.role };
        localStorage.setItem('activeUser', JSON.stringify(userToStore));
        setUser(userToStore);
    }

    return true;
  }

  const logout = () => {
    localStorage.removeItem('activeUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
