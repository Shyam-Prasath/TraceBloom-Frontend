// src/contexts/AuthContext.tsx
import { ethers } from 'ethers';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

export type UserRole = 'farmer' | 'distributor' | 'consumer';

interface User {
  id?: string;
  email?: string;
  walletAddress?: string;
  role?: UserRole;
}

interface AuthContextType {
  user: User | null;
  signup: (email: string, password: string, role: UserRole) => Promise<void>;
  connectWallet: (email: string, role: UserRole) => Promise<void>;
  logout: () => void;
  loadingWallet: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  signup: async () => {},
  connectWallet: async () => {},
  logout: () => {},
  loadingWallet: false,
});

const BACKEND_URL = import.meta.env.VITE_API_BASE || 'https://tracebloom-backend-2.onrender.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('auth-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const signup = async (email: string, password: string, role: UserRole) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');

      const userData: User = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
      };

      setUser(userData);
      localStorage.setItem('auth-user', JSON.stringify(userData));
      localStorage.setItem('token', data.token);
      localStorage.setItem('user-email', data.user.email);

      toast.success('Account created successfully');
    } catch (err: any) {
      toast.error(err.message || 'Signup failed');
      throw err;
    }
  };

  const connectWallet = async (email: string, role: UserRole) => {
    try {
      if (!(window as any).ethereum) {
        toast.error('MetaMask not detected');
        return;
      }

      setLoadingWallet(true);

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const walletAddress = (await signer.getAddress()).toLowerCase();

      // Get nonce
      const nonceRes = await fetch(`${BACKEND_URL}/api/auth/wallet/nonce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, email, role }),
      });

      const nonceData = await nonceRes.json();
      if (!nonceRes.ok) throw new Error(nonceData.error || 'Nonce fetch failed');

      // Sign message
      const message = `Sign this message to login to TraceBloom. Nonce: ${nonceData.nonce}`;
      const signature = await signer.signMessage(message);

      // Verify signature
      const verifyRes = await fetch(`${BACKEND_URL}/api/auth/wallet/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, signature }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.error || 'Wallet verification failed');

      const userData: User = {
        email: verifyData.user.email,
        role: verifyData.user.role,
        walletAddress: verifyData.user.walletAddress,
      };

      setUser(userData);
      localStorage.setItem('auth-user', JSON.stringify(userData));
      localStorage.setItem('token', verifyData.token);
      localStorage.setItem('user-email', verifyData.user.email);

      toast.success('Wallet connected successfully');
    } catch (err: any) {
      toast.error(err.message || 'Wallet authentication failed');
    } finally {
      setLoadingWallet(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('auth-user');
    toast.info('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, signup, connectWallet, logout, loadingWallet }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);