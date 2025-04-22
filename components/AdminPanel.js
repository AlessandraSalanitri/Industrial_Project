import { motion } from 'framer-motion';
import Image from 'next/image';
import { useUser } from '../context/UserContext';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { firebaseAuth, firestoreDB } from '../firebase/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import '../styles/admin_panel.css';

export default function AdminPanel({ onClose }) {
  const { user, logout } = useUser();
  const router = useRouter();

  const [linkedChildren, setLinkedChildren] = useState([]);

  const handlePersonalDetails = () => router.push('/parent/personal_details');
  const handleSubscription = () => router.push('/parent/subscription');
  const handleSettings = () => router.push('/parent/settings');
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const goToDashboard = () => router.push('/parent/dashboard');

  // Fetch linked accounts from Firestore
  const fetchLinkedAccounts = async () => {
    if (!user?.uid) return;

    try {
      const q = query(
        collection(firestoreDB, 'linkedAccounts'),
        where('parentId', '==', user.uid) // Filter by parentId (the current user)
      );
      const snapshot = await getDocs(q);
      const children = snapshot.docs.map(doc => doc.data().childEmail);
      setLinkedChildren(children); // Store linked children emails in state
    } catch (err) {
      console.error('Error fetching linked accounts:', err);
    }
  };

  useEffect(() => {
    fetchLinkedAccounts(); // Fetch linked accounts on load
  }, []);

  // Navigate to My Links page when the button is clicked
  const goToMyLinks = () => {
    router.push('/parent/my_links');
  };

  return (
    <motion.div
      className="admin-panel"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.4 }}
    >
      <div className="admin-header">
        <button onClick={onClose}>X</button>
      </div>

      <div className="admin-content">
        <div className="admin-avatar" onClick={goToDashboard} style={{ cursor: 'pointer' }}>
          <Image src="/assets/account.png" alt="Profile" width={100} height={100} />
          <div className="admin-username">{user?.email}</div>
        </div>

        <div className="admin-links">
          <button className="admin-btn" onClick={handlePersonalDetails}>
            <i className="icon">👤</i> Personal details
          </button>

          {/* Use goToMyLinks to navigate to My Links page */}
          <button className="admin-btn" onClick={goToMyLinks}>
            <i className="icon">🔗</i> My Links
          </button>

          <button className="admin-btn" onClick={handleSubscription}>
            <i className="icon">🧾</i> Subscription
          </button>

          <button className="admin-btn" onClick={handleSettings}>
            <i className="icon">⚙️</i> Settings
          </button>

          <button className="admin-btn logout" onClick={handleLogout}>
            <i className="icon">🔒</i> Logout
          </button>
        </div>
      </div>
    </motion.div>
  );
}
