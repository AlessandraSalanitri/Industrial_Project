import { createContext, useContext, useEffect, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on first render
  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const isSimulated = parsedUser?.isSimulated || false;

        setUser({
          ...parsedUser,
          isSimulated,
        });
      } catch (err) {
        console.error("[UserContext] Failed to parse user:", err);
      }
    }

    setLoading(false);
  }, []);

  // Login sets real or simulated child
  const login = (userData) => {
    const isSimulated = userData?.isSimulated || false;
  
    const updatedUser = isSimulated
      ? {
          ...userData,
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
  

  // Logout resets everything
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('mode');
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
