import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface User {
    id: string;
    email: string;
    role: 'admin' | 'member';
    ministry_id: string;
    ministry_name: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (data: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('auth_token');
            if (token) {
                try {
                    const userData = await apiClient.getMe();
                    setUser(userData);
                } catch (error) {
                    console.error('Auth initialization failed:', error);
                    localStorage.removeItem('auth_token');
                }
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    const login = async (data: any) => {
        const res = await apiClient.login(data);
        setUser(res.user);
    };

    const register = async (data: any) => {
        const res = await apiClient.register(data);
        setUser(res.user);
    };

    const logout = () => {
        apiClient.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
