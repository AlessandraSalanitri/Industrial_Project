import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/router';
import AvatarPanel from './AvatarPanel';
import AdminPanel from './AdminPanel';
import { useUser } from '../context/UserContext';
import { AnimatePresence } from "framer-motion";
import { ThemeToggle } from '../components/ThemeToggle';
import '../styles/nav.css';
import { useTranslation, Trans } from 'next-i18next';


export default function Navbar() {
  const router = useRouter();
  const { user } = useUser();
  const [showAvatarPanel, setShowAvatarPanel] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // 👈 New state
  const { t } = useTranslation('common');

  const isChildMode = router.pathname.startsWith('/child');

  const handleAvatarClick = () => {
    setShowAvatarPanel(true);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
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

          {/* Mobile Hamburger */}
          <div className="hamburger" onClick={toggleMobileMenu}>
            <div className={`bar ${mobileMenuOpen ? "open" : ""}`}></div>
            <div className={`bar ${mobileMenuOpen ? "open" : ""}`}></div>
            <div className={`bar ${mobileMenuOpen ? "open" : ""}`}></div>
          </div>

          <nav className={`main-nav ${mobileMenuOpen ? "show" : ""}`}>
          <ul>
            <li>
              <Link href="/" className={router.pathname === '/' ? 'active' : ''}>
                {t('HOME')}
              </Link>
            </li>

            {user?.role !== 'child' && !user?.isSimulated && (
              <>
                <li>
                  <Link href="/about" className={router.pathname === '/about' ? 'active' : ''}>
                    {t('ABOUT')}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className={router.pathname === '/contact' ? 'active' : ''}>
                    {t('CONTACT')}
                  </Link>
                </li>
              </>
            )}
          </ul>

          <div className="theme-toggle">
            <ThemeToggle />
          </div>

          {user && (
            <div className="account-icon">
              <Image
                src={isChildMode && avatarSrc ? avatarSrc : "/assets/account.png"}
                alt="Profile"
                width={50}
                height={50}
                className="avatar-icon"
                onClick={handleAvatarClick}
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
        {showAvatarPanel && isChildMode && (
          <AvatarPanel onClose={() => setShowAvatarPanel(false)} />
        )}
        {showAvatarPanel && !isChildMode && user?.role === "parent" && (
          <AdminPanel onClose={() => setShowAvatarPanel(false)} />
        )}
      </AnimatePresence>

      
    </header>
  );
}
