import React, { createContext, useContext, useState } from 'react';
import { getUser } from '../../services/db';

type AuthContextType = {
  isAuthenticated: boolean;
  user: any | null;
  login: (username: string, password: string, callback: (error: Error | null) => void) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);

  const login = (username: string, password: string, callback: (error: Error | null) => void) => {
    getUser(username, password, (err, user) => {
      if (err) {
        callback(err);
      } else if (user) {
        setUser(user);
        setIsAuthenticated(true);
        callback(null);
      } else {
        callback(new Error('Invalid credentials'));
      }
    });
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthProvider, useAuth };
export default AuthProvider; 