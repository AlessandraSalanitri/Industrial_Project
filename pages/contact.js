import Layout from '../components/Layout';
import Image from 'next/image';
import { useState , useEffect } from 'react';
import '../styles/contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDarkMode(document.body.classList.contains("dark-mode"));
    }
  }, []);


  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };


  const handleSubmit = (e) => {
    e.preventDefault();

    // Message submission
    alert(`Message sent to studioo@info.com!\n\nName: ${formData.name}\nEmail: ${formData.email}\nMessage: ${formData.message}`);

    // Reset form
    setFormData({ name: '', email: '', message: '' });
  };

  

  return (
    <Layout>
      <div className="contact-page">
      <div className="contact-info">
        <a href="#" className="contact-item" aria-label="Phone Number">
          <Image
            src={isDarkMode ? "/assets/phoneDark.svg" : "/assets/phoneLight.svg"}
            alt="Phone Icon"
            width={24}
            height={24}
          />
          <span>077 XXX XX</span>
        </a>

        <a href="#" className="contact-item" aria-label="Email">
          <Image
            src={isDarkMode ? "/assets/emailDark.svg" : "/assets/emailLight.svg"}
            alt="Email Icon"
            width={24}
            height={24}
          />
          <span>studioo@info.com</span>
        </a>

        <a href="#" className="contact-item" aria-label="Address">
          <Image
            src={isDarkMode ? "/assets/locationDark.png" : "/assets/locationLight.png"}
            alt="Location Icon"
            width={45}
            height={35}
          />
          <span>LONDON</span>
        </a>
      </div>


        {/* Contact Form */}
        <div className="contact-form-container">
          <h2>Contact Form</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <textarea
              name="message"
              placeholder="Insert your message here..."
              rows="5"
              value={formData.message}
              onChange={handleChange}
              required
            />
            <button type="submit" className="button button-primary">Send</button>
          </form>
        </div>

        {/* Social Icons */}
        <div className="socials">
        <a href="#" aria-label="Twitter">
          <Image src="/assets/twitter.svg" alt="Twitter" width={30} height={30} />
        </a>
        <a href="#" aria-label="Instagram">
          <Image src="/assets/insta.svg" alt="Instagram" width={30} height={30} />
        </a>
        <a href="#" aria-label="Facebook">
          <Image src="/assets/fb.svg" alt="Facebook" width={30} height={30} />
        </a>
      </div>
      </div>
    </Layout>
  );
}
