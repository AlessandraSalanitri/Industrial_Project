import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AvatarPanel from './AvatarPanel';
import AdminPanel from './AdminPanel'; 
import { useUser } from '../context/UserContext';
import { AnimatePresence } from "framer-motion";
import '../styles/nav.css';

export default function Navbar() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [isRestrictedMode, setIsRestrictedMode] = useState(false);
  const [showAvatarPanel, setShowAvatarPanel] = useState(false);

  useEffect(() => {
    const restricted = localStorage.getItem('restrictedMode') === 'true';
    setIsRestrictedMode(restricted);
  }, []);

  if (loading) return null;

  const handleAvatarClick = () => {
    if (!isRestrictedMode) {
      setShowAvatarPanel(true);
    }
  };

  const handleProfileClick = () => {
    if (!isRestrictedMode) {
      setShowAvatarPanel(true);
    }
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
              {!isRestrictedMode && (
                <>
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
                </>
              )}

              {isRestrictedMode && (
                <li><span style={{ color: '#888', fontWeight: 'bold' }}>Restricted Mode</span></li>
              )}
            </ul>

            {user && (
              <div className="account-icon">
                <Image
                  src={avatarSrc || "/assets/account.png"}
                  alt="Profile"
                  width={50}
                  height={50}
                  className="avatar-icon"
                  onClick={isRestrictedMode ? null : handleAvatarClick}
                  style={isRestrictedMode ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                />
              </div>
            )}
          </nav>

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
