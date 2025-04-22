import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import StoryList from '../../components/StoryList';
import '../../styles/child_dashboard.css';
import '../../styles/darkMode.css';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { firebaseAuth, firestoreDB } from '../../firebase/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function ChildDashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [stories, setStories] = useState([]);
  const [isRestricted, setIsRestricted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null); // NEW: For viewing full story content

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchStories();
    }
  }, [user]);

  const handleThemeToggle = (mode) => {
    const isDark = mode === 'dark';
    setDarkMode(isDark);
    localStorage.setItem('theme', mode);
    document.body.classList.toggle('dark-mode', isDark);
  };

  const fetchStories = async () => {
    setIsLoading(true);

    try {
      if (!user) {
        console.warn("No user logged in");
        setIsLoading(false);
        return;
      }

      const storiesRef = collection(firestoreDB, 'stories');
      const q = query(storiesRef, where('userId', '==', user.uid));
      const snapshot = await getDocs(q);

      const storiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setStories(storiesData);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exitRestrictedMode = async () => {
    const password = prompt('Enter parent password to exit restricted mode');
    if (!password) return;

    try {
      const currentUser = firebaseAuth.currentUser;
      if (!currentUser || !currentUser.email) {
        alert('No user is currently logged in.');
        return;
      }

      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);

      localStorage.setItem('restrictedMode', 'false');
      alert('Exiting restricted mode...');
      setIsRestricted(false);
      window.location.href = '/parent/dashboard';
    } catch (error) {
      console.error('Failed to exit restricted mode:', error);
      alert('Incorrect password. Please try again.');
    }
  };

  const handlePlayStory = (story) => {
    console.log("Play story:", story);
    setSelectedStory(story); // NEW: Show full story content
  };

  if (isLoading) {
    return <div>Loading stories...</div>;
  }

  return (
    <Layout>
      <div className="child-dashboard">
        <div className="theme-toggle top-right" style={{ marginBottom: '1rem' }}>
          <button className={`toggle-btn ${!darkMode ? 'active' : ''}`} onClick={() => handleThemeToggle('light')}>
            Light
          </button>
          <button className={`toggle-btn ${darkMode ? 'active' : ''}`} onClick={() => handleThemeToggle('dark')}>
            Dark
          </button>
        </div>

        <StoryList stories={stories} onPlay={handlePlayStory} />

        {isRestricted && (
          <div className="restricted-access">
            <p>You are currently in restricted mode. Please contact the parent to exit.</p>
          </div>
        )}

        <div className="exit-restricted-mode">
          <button className="button button-secondary" onClick={exitRestrictedMode}>
            Exit Restricted Mode (Parent Only)
          </button>
        </div>

        {/* NEW: Story Content Display */}
        {selectedStory && (
          <div className="story-content-view" style={{ marginTop: '30px', backgroundColor: '#f4f4f4', padding: '20px', borderRadius: '8px' }}>
            <h2>{selectedStory.title}</h2>
            <p><strong>Age:</strong> {selectedStory.age}</p>
            <p><strong>Genre:</strong> {selectedStory.genre}</p>
            <p><strong>Main Character:</strong> {selectedStory.character}</p>
            <p><strong>Story:</strong></p>
            <p>{selectedStory.content}</p>
            <button
              style={{
                marginTop: '15px',
                backgroundColor: '#4b0082',
                color: 'white',
                padding: '8px 14px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              onClick={() => setSelectedStory(null)}
            >
              Close Story
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
