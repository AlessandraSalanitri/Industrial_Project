import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import '../styles/layout.css';
import { useUser } from '../context/UserContext';

export default function Layout({ children }) {
  const { user } = useUser();
  const [isRestrictedMode, setIsRestrictedMode] = useState(false);

  useEffect(() => {
    const restricted = localStorage.getItem('restrictedMode');
    setIsRestrictedMode(restricted === 'true');

    // Optional: add a class to body for global restricted styling
    if (restricted === 'true') {
      document.body.classList.add('restricted-mode');
    } else {
      document.body.classList.remove('restricted-mode');
    }
  }, []);

  return (
    <div className="layout">
      <Navbar isRestrictedMode={isRestrictedMode} />
      <main className="content">{children}</main>
      <Footer />
    </div>
  );
}
