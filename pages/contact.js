import Layout from '../components/Layout';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import '../styles/contact.css';
import { firestoreDB } from '../firebase/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// import emailjs from 'emailjs-com'; // Uncomment if you want to use EmailJS

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Log form data to make sure we are submitting correct data
    console.log("Form Data:", formData);

    try {
      console.log("Submitting to Firestore...");

      // Add document to Firestore collection 'contacts'
      const docRef = await addDoc(collection(firestoreDB, 'contacts'), {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        timestamp: serverTimestamp(),
      });

      // Log the document ID after successful write
      console.log("Document written with ID: ", docRef.id);

      // Optional: Send Email via EmailJS
      /*
      await emailjs.send(
        'YOUR_SERVICE_ID',
        'YOUR_TEMPLATE_ID',
        {
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message,
          to_email: 'industrialprojectsolent@gmail.com'
        },
        'YOUR_PUBLIC_KEY'
      );
      */

      alert('Message sent successfully!');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      // Log any errors that occur
      console.error("Error writing document: ", error);
      alert('Failed to send message. Check console for details.');
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
