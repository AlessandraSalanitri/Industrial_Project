// context/UserContext.js keep stored the user login- keep track of his status 
// then in navbar the condition of display based on the user logged in, and his role,
// displays either the avatar (if user == child) or the profile icon (if user == parent)
// Makes user data available globally via useUser()
import { createContext, useContext, useEffect, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    console.log("[UserContext] Reading user from localStorage:", storedUser);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("[UserContext] Parsed user:", parsedUser);
        setUser(parsedUser);
      } catch (err) {
        console.error("[UserContext] Failed to parse user:", err);
      }
    }
  }, []);


  // use helpers here: firebase/auth/signin- signout
  const login = (userData) => {
    console.log("[UserContext] Logging in user:", userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };
  
  const logout = () => {
    console.log("[UserContext] Logging out user");
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

