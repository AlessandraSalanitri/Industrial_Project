import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/router';
import AvatarPanel from './AvatarPanel';
import AdminPanel from './AdminPanel'; 
import { useUser } from '../context/UserContext';
import { AnimatePresence } from "framer-motion";
import '../styles/nav.css';

export default function Navbar() {
  const router = useRouter();
  const { user } = useUser(); // Only use what's actually provided by context
  console.log("[Navbar] Current user:", user);

  // UI state for avatar/profile panel
  const [showAvatarPanel, setShowAvatarPanel] = useState(false);

  const handleAvatarClick = () => {
    console.log("[Navbar] Avatar clicked");
    setShowAvatarPanel(true);
  };
  
  const handleProfileClick = () => {
    console.log("[Navbar] Profile clicked");
    setShowAvatarPanel(true);
  };

  const avatarSrc = user?.avatar ? `/assets/avatars/${user.avatar}.png` : null;

  return (
    <header>
      <div className="navbar-wrapper">
        <div className="top-bar">
          <Image
            src="/assets/logo.png"
            alt="Studioo Logo"
            width={0}
            height={0}
            sizes="100vw"
            className="logo-left"
          />
  
          <nav className="main-nav">
            <ul>
              <li>
                <Link href="/" legacyBehavior>
                  <a className={router.pathname === '/' ? 'active' : ''}>HOME</a>
                </Link>
              </li>
              <li>
                <Link href="/about" legacyBehavior>
                  <a className={router.pathname === '/about' ? 'active' : ''}>ABOUT</a>
                </Link>
              </li>
              <li>
                <Link href="/contact" legacyBehavior>
                  <a className={router.pathname === '/contact' ? 'active' : ''}>CONTACT</a>
                </Link>
              </li>
            </ul>
  
            {/* Avatar/Profile aligned to nav */}
            {user && (
              <div className="account-icon">
                {user.role === "child" && user.avatar ? (
                  <Image
                    src={`/assets/avatars/${user.avatar}.png`}
                    alt="Avatar"
                    width={50}
                    height={50}
                    className="avatar-icon"
                    onClick={handleAvatarClick}
                  />
                ) : (
                  <Image
                    src="/assets/account.png"
                    alt="Profile"
                    width={50}
                    height={50}
                    className="avatar-icon"
                    onClick={handleProfileClick}
                  />
                )}
              </div>
            )}
          </nav>
  
          {/* Decorative Side Logo */}
          <Image
            src="/assets/side_logo.png"
            alt="Decorative Lines"
            width={0}
            height={0}
            sizes="100vw"
            className="logo-right"
          />
        </div>
      </div>
  
      {/* Conditional Panels */}
      <AnimatePresence>
          {showAvatarPanel && user?.role === "child" && (
        <AvatarPanel onClose={() => setShowAvatarPanel(false)} />
        )}
          {showAvatarPanel && user?.role === "parent" && (
        <AdminPanel onClose={() => setShowAvatarPanel(false)} />
        )}
      </AnimatePresence>
    </header>
  );
}