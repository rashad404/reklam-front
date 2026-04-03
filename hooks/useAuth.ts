'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api/client';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  wallet_id?: string;
  is_admin: boolean;
  advertiser?: any;
  publisher?: any;
  created_at?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiClient.get('/auth/user');
        setUser(response.data.data);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const handleAuthChange = () => checkAuth();
    window.addEventListener('authStateChanged', handleAuthChange);
    return () => window.removeEventListener('authStateChanged', handleAuthChange);
  }, []);

  return { user, isAuthenticated, isLoading };
}
