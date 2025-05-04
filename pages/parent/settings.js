import { useState, useEffect } from 'react';
import VoiceSelector from '../../components/VoiceSelector';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { firebaseAuth, firestoreDB } from '../../firebase/firebaseConfig';
import { doc, updateDoc, collection, addDoc, getDoc } from 'firebase/firestore';
import { ThemeToggle } from '../../components/ThemeToggle';
import '../../styles/settings.css';

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [childEmail, setChildEmail] = useState('');
  const [user, setUser] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserSettings = async () => {
      const currentUser = firebaseAuth.currentUser;
      if (currentUser) {
        setUser(currentUser);

        try {
          const userDocRef = doc(firestoreDB, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.notificationsEnabled !== undefined) {
              setNotificationsEnabled(userData.notificationsEnabled);
            }
            if (userData.selectedVoice) {
              setSelectedVoice(userData.selectedVoice);
            }
          }
        } catch (error) {
          console.error("Failed to fetch user settings:", error);
        }
      } else {
        router.push('/login');
      }
    };

    fetchUserSettings();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  const handleVoiceSelect = async (voice) => {
    setSelectedVoice(voice);

    try {
      if (user && voice) {
        const userDocRef = doc(firestoreDB, "users", user.uid);
        await updateDoc(userDocRef, {
          selectedVoice: {
            name: voice.name,
            lang: voice.lang,
          },
        });
        alert(`Your choice has been saved! "${voice.name}" will read your stories now.`);
      }
    } catch (error) {
      console.error("Failed to save selected voice:", error);
      alert("Failed to save voice.");
    }
  };

  const handleNotificationToggle = async (enabled) => {
    setNotificationsEnabled(enabled);

    try {
      if (user) {
        const userDocRef = doc(firestoreDB, "users", user.uid);
        await updateDoc(userDocRef, {
          notificationsEnabled: enabled,
        });
      }
    } catch (error) {
      console.error("Failed to update notification setting:", error);
      alert("Failed to update notification setting.");
    }
  };

  const handleChildLink = async () => {
    if (!childEmail) {
      alert('Please enter a valid email.');
      return;
    }

    if (!user) {
      alert('You must be signed in to link an account.');
      return;
    }

    try {
      const linkedAccountsRef = collection(firestoreDB, 'linkedAccounts');
      await addDoc(linkedAccountsRef, {
        parentId: user.uid,
        childEmail: childEmail,
      });

      alert(`Child account linked with: ${childEmail}`);
      setChildEmail('');
    } catch (error) {
      console.error("Failed to link child account:", error);
      alert("Failed to link child account.");
    }
  };

  return (
    <Layout>
      <div className="container settings-container">
        <h2 className="settings-title">SETTINGS</h2>

        {/* Mode Toggle */}
        <div className="theme-toggle">
          <ThemeToggle />
        </div>

        {/* Notifications Toggle */}
        <div className="setting-row">
          <span className="setting-label">Notifications</span>
          <div className="toggle-group">
            <button
              className={`toggle-btn ${notificationsEnabled ? 'active' : ''}`}
              onClick={() => handleNotificationToggle(true)}
            >
              On
            </button>
            <button
              className={`toggle-btn ${!notificationsEnabled ? 'active' : ''}`}
              onClick={() => handleNotificationToggle(false)}
            >
              Off
            </button>
          </div>
        </div>

        {/* Voice Selector */}
        <VoiceSelector user={user} />

        {/* Parental Control */}
        <div className="setting-section">
          <h3>Parental Control</h3>
          <div className="link-child-container">
            <input
              type="email"
              placeholder="Enter child's email"
              value={childEmail}
              onChange={(e) => setChildEmail(e.target.value)}
            />
            <button className="button button-primary" onClick={handleChildLink}>
              Link Account
            </button>
          </div>

          <div className="info-box">
            <h4>Why Link Your Account?</h4>
            <p>
              Linking your account with your child’s helps personalize their storytelling experience.
              When you create or edit stories, or choose a preferred narration voice, these changes
              will automatically reflect in your child’s account, ensuring they always enjoy the
              stories the way you intended. It’s a simple way to stay connected and enhance their
              bedtime experience with just one click.
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="button-row">
          <button className="button button-secondary" onClick={() => window.history.back()}>Go back</button>
          <button className="button button-primary" onClick={() => alert('Settings saved!')}>Confirm</button>
        </div>
      </div>
    </Layout>
  );
}
