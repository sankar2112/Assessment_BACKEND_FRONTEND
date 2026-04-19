import React, { createContext, useContext, useState, useEffect } from 'react';
import { graphqlRequest } from '../utils/graphql';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const query = `
        query {
          getCurrentUser {
            id
            username
            email
            firstName
            lastName
            phone
            bio
            roles
          }
        }
      `;
      const data = await graphqlRequest(query);
      
      if (data && data.getCurrentUser) {
        setUser(data.getCurrentUser);
        localStorage.setItem('user', JSON.stringify(data.getCurrentUser));
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch current user, falling back to local storage:", error);
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch(e) {
          localStorage.removeItem('user');
        }
      }
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        await fetchCurrentUser();
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (userData, token) => {
    // Set initial token and partial user data synchronously for immediate UI updates
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    // The login mutation only returns limited fields (username, email, roles).
    // We must immediately fetch the full profile (firstName, bio, etc) from the backend.
    await fetchCurrentUser();
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
