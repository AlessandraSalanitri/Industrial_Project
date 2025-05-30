//pages/parent/dashboard
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
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default function ParentDashboard() {
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true); // new state
  const { t } = useTranslation('common');
  
  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (user) => {
      if (user) {
        
        const checkAndResetCredits = async () => {
          const userDocRef = doc(firestoreDB, "users", user.uid);
          const userSnap = await getDoc(userDocRef);
        
          if (userSnap.exists()) {
            const data = userSnap.data();
            const plan = data.subscriptionPlan || "free";
            const today = new Date().toISOString().split("T")[0];
        
            if (plan !== "unlimited") {
              const defaultCredits = plan === "pro" ? 30 : 5;
              const lastReset = data.lastCreditReset;
        
              if (lastReset !== today) {
                await updateDoc(userDocRef, {
                  creditsToday: defaultCredits,
                  lastCreditReset: today
                });
        
                // refresh localStorage if you're relying on it
                const updatedUser = {
                  ...data,
                  creditsToday: defaultCredits,
                  lastCreditReset: today
                };
                localStorage.setItem("user", JSON.stringify(updatedUser));
              }
            }
          }
        };
        await checkAndResetCredits(user);

        try {
          // 🔔 Fetch user's notification setting
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
        realEmail: parentEmail,
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

  

  return (
    <Layout>
      {/* === TOP CONTROLS === */}
      {(notificationsEnabled || true) && (
        <div className="top-controls">
        <div className="top-controls-inner">
           
          {/* RIGHT: NOTIFICATION BELL */}
          <div className={`notification-container shake-on-new ${unreadCount > 0 ? 'has-unread' : ''}`}>
            <Bell size={32} onClick={toggleDropdown} className="notification-bell-icon" />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
            {dropdownOpen && (
  <div className="notification-dropdown">
    {notifications.length === 0 ? (
      <p className="notification-empty">{t('noNotifications')}</p>
    ) : (
      <>
        {/* ✅ Clear Button on top */}
        <button
          className="clear-notifications-btn"
          onClick={async () => {
            await Promise.all(
              notifications.map(async (notification) => {
                const ref = doc(firestoreDB, "stories", notification.id);
                await updateDoc(ref, { read: true });
              })
            );
            setNotifications([]); // Clear local state
            setDropdownOpen(false); // Optional: close dropdown
          }}
        >
          {t('Clear All') || 'Clear All Notifications'}
        </button>

        {/* Notifications List */}
        {notifications.map((notification) => (
          <div key={notification.id} className="notification-item">
            <strong>{notification.title}</strong>
            <p>{notification.createdAt}</p>
          </div>
        ))}
      </>
    )}
  </div>
)}
          </div>
      
        </div>
      </div>
      
      // </div>
      )}
  
      {/* === Main Dashboard === */}
      <div className="admin-dashboard">
        <h1 className="dashboard-title">{t('adminDashboard')}</h1>
  
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
            {t('createNewStory')}
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
            {t('manageSavedStory')}
            </Link>
          </div>
  
          <div className="dashboard-card">
            <Image
              src="/assets/child.png"
              alt="Child Mode"
              width={280}
              height={325}
              className="dashboard-image"
            />
            <button
              className="button button-primary"
              onClick={switchToChildMode}
            >
              {t('enterChildMode')}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}