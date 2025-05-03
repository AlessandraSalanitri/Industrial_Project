import { motion } from 'framer-motion';
import Image from 'next/image';
import { useUser } from '../context/UserContext';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { firebaseAuth, firestoreDB } from '../firebase/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import '../styles/admin_panel.css';
import { doc, getDoc } from 'firebase/firestore';


export default function AdminPanel({ onClose }) {
  const { user, setUser, logout } = useUser();
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

  // ✅ Fetch user data to refresh credits (supports both userId and uid)
  const fetchUserData = async () => {
    const userId = user?.userId || user?.uid; // Fallback if one is missing
    if (!userId) return;

    try {
      const userRef = doc(firestoreDB, 'users', userId);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const updatedUser = {
          ...user,
          ...docSnap.data(),
          userId, // Ensure it's included
        };

        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error("⚠️ Failed to refresh user data:", err);
    }
  };


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
    fetchUserData();
    fetchLinkedAccounts(); // Fetch linked accounts on load
  }, []);

  // Check if the user has linked accounts
  const goToMyLinks = () => {
    router.push('/parent/my_links'); 
    
  };

  const planLabel = {
    free: "Studio Free",
    pro: "Studio Pro",
    unlimited: "Studio Unlimited"
  }[user?.subscriptionPlan] || "Unknown Plan";

  
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

        {/* 🔔 Subscription Info */}
        {user?.subscriptionPlan && (
          <div className="admin-plan-info">
            <div className="plan-name">
              <strong>Current Plan:</strong> {planLabel}
            </div>

            {/* Show credits if on free or pro */}
            {["free", "pro"].includes(user.subscriptionPlan) && (
              <div className="plan-credits">
                <strong>🪙 Credits:</strong> {user.creditsToday ?? 0} left today
              </div>
            )}
          </div>
        )}

          <button className="admin-btn" onClick={handlePersonalDetails}>
            <i className="icon">👤</i> Personal details
          </button>

          <button className="admin-btn" onClick={handleSubscription}>
            <i className="icon">🧾</i> Subscription
          </button>

          <button className="admin-btn" onClick={goToMyLinks}>
          <i className="icon">🔗</i> Linked account 
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
