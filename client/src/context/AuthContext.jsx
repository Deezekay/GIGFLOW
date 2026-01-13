import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // DEMO MODE: Disable auto-login check to force "Fresh Start" on reload
        setLoading(false);
        /*
        const checkUserLoggedIn = async () => {
            try {
                const res = await api.get('/api/auth/me');
                setUser(res.data);
            } catch (err) {
                // Not logged in or cookie expired
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkUserLoggedIn();
        */
    }, []);

    const login = (userData) => {
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
        // Ideally call logout endpoint
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
