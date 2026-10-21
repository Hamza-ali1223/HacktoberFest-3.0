import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data);

      const savedUserId = localStorage.getItem('campus_connect_user_id');
      if (savedUserId) {
        const found = data.find(u => u.id === Number(savedUserId));
        if (found) {
          setCurrentUser(found);
          return;
        }
      }

      // Default to User 1 (Bilal Ahmed) or first user
      if (data.length > 0) {
        setCurrentUser(data[0]);
        localStorage.setItem('campus_connect_user_id', data[0].id);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const switchUser = (userId) => {
    const selected = users.find(u => u.id === Number(userId));
    if (selected) {
      setCurrentUser(selected);
      localStorage.setItem('campus_connect_user_id', selected.id);
    }
  };

  const refreshCurrentUser = async () => {
    if (!currentUser) return;
    try {
      const updated = await api.getUser(currentUser.id);
      setCurrentUser(updated);
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    } catch (err) {
      console.error('Error refreshing current user:', err);
    }
  };

  return (
    <UserContext.Provider value={{ users, currentUser, switchUser, refreshCurrentUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
