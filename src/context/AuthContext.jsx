import React, { createContext, useContext, useState, useEffect } from 'react';
import { graphqlRequest } from '../utils/graphql';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      // Decode the payload part of the JWT
      const payload = JSON.parse(atob(token.split('.')[1]));
      // JWT exp is in seconds, Date.now() is in milliseconds
      return payload.exp * 1000 < Date.now();
    } catch (e) {
      return true;
    }
  };

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('token');

    // Check if token strictly exists and is not expired
    if (isTokenExpired(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      return;
    }

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
      // If the backend rejects the token (e.g. expired or invalid signature), log them out
      const errMsg = error.message ? error.message.toLowerCase() : '';
      if (errMsg.includes('unauthorized') || errMsg.includes('jwt') || errMsg.includes('expired') || errMsg.includes('denied')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } else {
        // Only fallback to local storage if it's a generic network error
        console.error("Network error, falling back to local storage:", error);
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            localStorage.removeItem('user');
          }
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

  // Automatically check for expiration in the background every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token && isTokenExpired(token)) {
        console.log("Session expired. Logging out automatically.");
        logout();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
