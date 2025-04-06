import Navbar from './Navbar';
import Footer from './Footer';
import '../styles/layout.css';
import { useUser } from '../context/UserContext';

// Wraps all pages with shared UI
// Automatically pulls in the logged-in user
// Renders Navbar and Footer

export default function Layout({ children }) {
  const { user } = useUser(); 

  return (
    <div className="layout">
      <Navbar />
      <main className="content">{children}</main>
      <Footer />
    </div>
  );
}
