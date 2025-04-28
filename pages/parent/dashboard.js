
import { useEffect, useState } from 'react';
import { Bell } from 'phosphor-react';
import { doc, updateDoc, collection, query, where, onSnapshot, addDoc, getDocs, getDoc } from "firebase/firestore"; // Added getDoc here
import { firebaseAuth, firestoreDB } from "../../firebase/firebaseConfig";
import Layout from '../../components/Layout';
import Image from 'next/image';
import Link from 'next/link';
import '../../styles/parent_dashboard.css';
import '../../styles/darkMode.css';
import '../../styles/notification_bell.css'; // Separate new CSS for the bell

export default function ParentDashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true); // new state

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Fetch user's notification setting
          const userDocRef = doc(firestoreDB, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.notificationsEnabled !== undefined) {
              setNotificationsEnabled(userData.notificationsEnabled);
            }
          }

          // Setup real-time notifications listener
          const q = query(
            collection(firestoreDB, "stories"),
            where("userId", "==", user.uid) // Your adjusted field
          );

          const unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
            const newNotifications = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              title: doc.data().title || 'Untitled Story',
              createdAt: doc.data().createdAt?.toDate().toLocaleString() || 'Unknown time',
              read: doc.data().read || false, // from Firestore
            }));
            setNotifications(newNotifications);
          }, (error) => {
            console.error("Error with real-time notifications:", error);
          });

          return unsubscribeSnapshot;
        } catch (error) {
          console.error("Error fetching user settings or notifications:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleDropdown = async () => {
    setDropdownOpen(prev => {
      const newState = !prev;

      if (newState) {
        notifications.forEach(async (notification) => {
          if (!notification.read) {
            const notificationRef = doc(firestoreDB, "stories", notification.id);
            await updateDoc(notificationRef, { read: true });
          }
        });
      }

      return newState;
    });
  };

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  const switchToChildMode = async () => {
    const currentUser = firebaseAuth.currentUser;

    if (!currentUser) {
      console.error("No authenticated user found.");
      return;
    }

    const parentEmail = currentUser.email;
    const parentId = currentUser.uid;
    const simulatedChildEmail = `${parentEmail}-child@simulated.com`;

    try {
      const linkedQuery = query(
        collection(firestoreDB, "linkedAccounts"),
        where("childEmail", "==", simulatedChildEmail)
      );
      const snapshot = await getDocs(linkedQuery);

      if (snapshot.empty) {
        await addDoc(collection(firestoreDB, "linkedAccounts"), {
          childEmail: simulatedChildEmail,
          parentId: parentId,
        });
        console.log("Simulated child link created.");
      }

      const simulatedUser = {
        email: simulatedChildEmail,
        role: 'child',
        isSimulated: true,
        userId: `${parentId}-simulated`
      };

      localStorage.setItem('mode', 'child');
      localStorage.setItem('user', JSON.stringify(simulatedUser));

      window.location.href = "/child/dashboard";
    } catch (error) {
      console.error("Error linking simulated child account:", error);
    }
  };  

  const handleThemeToggle = (mode) => {
    const isDark = mode === 'dark';
    setDarkMode(isDark);
    localStorage.setItem('theme', mode);
    document.body.classList.toggle('dark-mode', isDark);
  };
  

  return (
    <Layout>
      {/* Notification Bell - only show if notifications are enabled */}
      {notificationsEnabled && (
        <div className="notification-container">
          <Bell size={32} onClick={toggleDropdown} className="notification-bell-icon" />
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
          {dropdownOpen && (
            <div className="notification-dropdown">
              {notifications.length === 0 ? (
                <p className="notification-empty">No notifications</p>
              ) : (
                notifications.map((notification) => (
                  <div key={notification.id} className="notification-item">
                    <strong>{notification.title}</strong>
                    <p>{notification.createdAt}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Your existing dashboard layout untouched */}
      <div className="admin-dashboard">
      <div className="theme-toggle top-right" style={{ marginBottom: '1rem' }}>
          <button className={`toggle-btn ${!darkMode ? 'active' : ''}`} onClick={() => handleThemeToggle('light')}>
            Light
          </button>
          <button className={`toggle-btn ${darkMode ? 'active' : ''}`} onClick={() => handleThemeToggle('dark')}>
            Dark
          </button>
        </div>
        
        <h1 className="dashboard-title">Admin Dashboard</h1>

        <div className="dashboard-actions">
          <div className="dashboard-card">
            <Image
              src="/assets/create_story.png"
              alt="Create New Story"
              width={280}
              height={320}
              className="dashboard-image"
            />
            <Link href="/parent/create-story" className="button button-primary">
              Create new story
            </Link>
          </div>

          <div className="dashboard-card">
            <Image
              src="/assets/saved_story.png"
              alt="Manage Saved Story"
              width={280}
              height={320}
              className="dashboard-image"
            />
            <Link href="/parent/my-stories" className="button button-primary">
              Manage saved story
            </Link>
          </div>

          <div className="dashboard-card">
            <Image
              src="/assets/child.png"
              alt="Child Mode"
              width={280}
              height={320}
              className="dashboard-image"
            />
            <button
              className="button button-primary"
              onClick={switchToChildMode}
            >
              Enter Child Mode
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
