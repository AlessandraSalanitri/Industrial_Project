// context/UserContext.js keep stored the user login- keep track of his status 
// then in navbar the condition of display based on the user logged in, and his role,
// displays either the avatar (if user == child) or the profile icon (if user == parent)
// Makes user data available globally via useUser()

import { createContext, useContext, useEffect, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const simulatedChildMode = localStorage.getItem('mode') === 'child';
  
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
  
        const finalUser = simulatedChildMode
          ? {
              ...parsedUser,
              email: `${parsedUser.email}-child@simulated.com`,
              role: 'child',
              isSimulated: true,
            }
          : {
              ...parsedUser,
              isSimulated: false,
            };
  
        setUser(finalUser);
      } catch (err) {
        console.error("[UserContext] Failed to parse user:", err);
      }
    }
  
    setLoading(false);
  }, []);
  
  const login = (userData) => {
    const simulatedChildMode = localStorage.getItem('mode') === 'child';
  
    const updatedUser = simulatedChildMode
      ? {
          ...userData,
          email: `${userData.email}-child@simulated.com`,
          role: 'child',
          isSimulated: true,
        }
      : {
          ...userData,
          isSimulated: false,
        };
  
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      login,
      logout,
      loading
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
