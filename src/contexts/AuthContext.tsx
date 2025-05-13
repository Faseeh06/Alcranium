import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { 
  auth, 
  loginUser, 
  registerUser, 
  logoutUser, 
  loginWithGoogle,
  subscribeToAuthChanges 
} from '@/lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, displayName: string) => Promise<User>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      setLoading(false);
      
      // Set localStorage item for backward compatibility with existing code
      if (user) {
        localStorage.setItem('isAuthenticated', 'true');
      } else {
        localStorage.removeItem('isAuthenticated');
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    return loginUser(email, password);
  };

  const register = async (email: string, password: string, displayName: string) => {
    return registerUser(email, password, displayName);
  };

  const logout = async () => {
    await logoutUser();
  };

  const signInWithGoogle = async () => {
    return loginWithGoogle();
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    signInWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 