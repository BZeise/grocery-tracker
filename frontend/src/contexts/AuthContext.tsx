import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types';

interface UserContextType {
  currentUser: User | null;
  isLoading: boolean;
  selectUser: (user: User) => void;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_KEY = 'grocery_tracker_user';

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(USER_KEY);
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored) as User);
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const selectUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  };

  const clearUser = () => {
    setCurrentUser(null);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <UserContext.Provider value={{ currentUser, isLoading, selectUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
