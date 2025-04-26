import Layout from '../components/Layout';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import '../styles/contact.css';
import { firestoreDB } from '../firebase/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import emailjs from 'emailjs-com'; // Import EmailJS

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    title: '' 
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Log form data to make sure we are submitting correct data
    console.log("Form Data:", formData);

    try {
      // Send email using EmailJS with the correct service ID, template ID, and public key
      const result = await emailjs.send(
        'service_xxu8e4n',  // Your EmailJS service ID
        'template_t7azekd', // Your new EmailJS template ID
        {
          name: formData.name,
          email: formData.email,
          title: formData.title,  // Added title to email content
          message: formData.message,  // Include the message in the email
          to_email: 'industrialprojectsolent@gmail.com', // Admin email
        },
        'MNE0hJ3U3zl8h2DjQ' // Your EmailJS public key
      );

      console.log('Email sent successfully:', result);

      // Add document to Firestore collection 'contacts'
      const docRef = await addDoc(collection(firestoreDB, 'contacts'), {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        title: formData.title,  // Save the title in the Firestore document
        timestamp: serverTimestamp(),
      });

      // Log the document ID after successful write
      console.log("Document written with ID: ", docRef.id);

      alert('Message sent successfully!');
      setFormData({ name: '', email: '', message: '', title: '' }); // Reset the form
    } catch (error) {
      // Log the error with more details for debugging
      console.error("Error sending email or writing document: ", error);

      // Safely check if error.message exists before calling 'includes'
      if (error && error.message && error.message.includes('EmailJS')) {
        alert('Error: Failed to send email. Please check the email configuration.');
      } else if (error && error.code === 'permission-denied') {
        alert('Error: You don\'t have permission to save data to Firestore.');
      } else {
        alert('Failed to send message. Check console for details.');
      }
    }
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
            <input
              type="text"
              name="title"
              placeholder="Title of your message"
              value={formData.title}
              onChange={handleChange}
              required
            />
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
