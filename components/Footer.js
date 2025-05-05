import Link from 'next/link';
import '../styles/footer.css';
import { useTranslation } from 'next-i18next';

export default function Footer() {
  const { t } = useTranslation('common'); // ✅ move this inside the component

  const isDarkMode =
    typeof window !== 'undefined' &&
    document.body.classList.contains('dark-mode');

  return (
    <footer className={isDarkMode ? 'dark' : ''}>
      <div className="footer-container">
        {/* Column 1: Company Info */}
        <div className="footer-column">
          <h3>Studioo</h3>
          <p>📍 {t('Location')}: London, UK</p>
          <p>📧 {t('Email')}: support@studioo.com</p>
        </div>

        {/* Column 2: Social Media Icons */}
        <div className="footer-column">
          <h3>{t('Follow Us')}</h3>
          <div className="social-icons">
            <a href="#"><img src="/assets/fb.svg" alt="Facebook" /></a>
            <a href="#"><img src="/assets/insta.svg" alt="Instagram" /></a>
            <a href="#"><img src="/assets/twitter.svg" alt="Twitter" /></a>
          </div>
        </div>

        {/* Column 3: Navigation Links */}
        <div className="footer-column">
          <h3>{t('Quick Links')}</h3>
          <ul>
            <li><Link href="/" legacyBehavior><a>{t('HOME')}</a></Link></li>
            <li><Link href="/about" legacyBehavior><a>{t('ABOUT')}</a></Link></li>
            <li><Link href="/contact" legacyBehavior><a>{t('CONTACT')}</a></Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
