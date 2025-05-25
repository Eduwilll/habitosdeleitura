import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getUser } from '../../services/db';

type AuthContextType = {
  isAuthenticated: boolean;
  user: any | null;
  login: (username: string, password: string, callback: (error: Error | null) => void) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = '@habitosdeleitura:user';

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved user data when app starts
  useEffect(() => {
    loadSavedUser();
  }, []);

  const loadSavedUser = async () => {
    try {
      const savedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error loading saved user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string, callback: (error: Error | null) => void) => {
    try {
      getUser(username, password, async (err, user) => {
        if (err) {
          callback(err);
        } else if (user) {
          // Save user data to AsyncStorage
          await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
          setUser(user);
          setIsAuthenticated(true);
          callback(null);
        } else {
          callback(new Error('Invalid credentials'));
        }
      });
    } catch (error) {
      callback(error instanceof Error ? error : new Error('Login failed'));
    }
  };

  const logout = async () => {
    try {
      // Remove user data from AsyncStorage
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  // console.log("context",context)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthProvider, useAuth };
export default AuthProvider; 