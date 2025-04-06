import Link from 'next/link';
import '../styles/footer.css';

export default function Footer() {
  return (
    <footer>
      <div className="footer-container">
        {/* Column 1: Company Info */}
        <div className="footer-column">
          <h3>Studioo</h3>
          <p>📍 Location: London, UK</p>
          <p>📧 Email: support@studioo.com</p>
        </div>

        {/* Column 2: Social Media Icons */}
        <div className="footer-column">
          <h3>Follow Us</h3>
          <div className="social-icons">
            <a href="#"><img src="/assets/fb.svg" alt="Facebook" /></a>
            <a href="#"><img src="/assets/insta.svg" alt="Instagram" /></a>
            <a href="#"><img src="/assets/twitter.svg" alt="Twitter" /></a>
          </div>
        </div>

        {/* Column 3: Navigation Links */}
        <div className="footer-column">
          <h3>Quick Links</h3>
          <ul>
            <li><Link href="/" legacyBehavior><a>Home</a></Link></li>
            <li><Link href="/about" legacyBehavior><a>About</a></Link></li>
            <li><Link href="/contact" legacyBehavior><a>Contact</a></Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
