// pages/child/dashboard.js

import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import StoryList from '../../components/StoryList';
import '../../styles/child_dashboard.css';
import '../../styles/darkMode.css';
import { firebaseAuth, firestoreDB } from '../../firebase/firebaseConfig';
import { collection, getDoc, doc, query, where, getDocs, updateDoc } from 'firebase/firestore';

export default function ChildDashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);
  const [imageList, setImageList] = useState([]);

  const [showImageSelector, setShowImageSelector] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);


  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(firestoreDB, 'users', currentUser.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
        const isSimulated = localStorage.getItem('mode') === 'child';
        const simulatedEmail = `${currentUser.email}-child@simulated.com`;

        setUser({
          userId: currentUser.uid,
          email: isSimulated ? simulatedEmail : currentUser.email,
          role: isSimulated ? 'child' : userData.role || 'child',
          isSimulated,
          ...userData
        });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) fetchStories();
  }, [user]);

  const fetchStories = async () => {
    setIsLoading(true);
    try {
      const emailToCheck = user?.email;
      if (!emailToCheck) return;

      const linkedQuery = query(
        collection(firestoreDB, 'linkedAccounts'),
        where('childEmail', '==', emailToCheck)
      );

      const snapshot = await getDocs(linkedQuery);
      const parentIds = snapshot.docs.map(doc => doc.data().parentId);

      if (parentIds.length === 0) return;

      const storiesQuery = query(
        collection(firestoreDB, 'stories'),
        where('userId', 'in', parentIds)
      );

      const storiesSnap = await getDocs(storiesQuery);
      const storiesData = storiesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStories(storiesData);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch("/api/story-images");
        const data = await res.json();
        if (res.ok) {
          setImageList(data.images.map(name => `/assets/story-images/${name}`));
        }
      } catch (err) {
        console.error("Failed to load story images", err);
      }
    };
  
    fetchImages();
  }, []);
  

  const handleThemeToggle = (mode) => {
    const isDark = mode === 'dark';
    setDarkMode(isDark);
    localStorage.setItem('theme', mode);
    document.body.classList.toggle('dark-mode', isDark);
  };
  



  const handlePlayStory = (story) => {
    setSelectedStory(story);
  };

  const getStoryImage = () => {
    return selectedStory?.customImage || "/assets/story-images/default.jpg";
  };

  if (isLoading) return <div>Loading stories...</div>;

  return (
    <Layout>
      <div className="child-dashboard">

        {/* 🌞🌙 Light/Dark Toggle */}
        <div className="theme-toggle top-right" style={{ marginBottom: '1rem' }}>
          <button
            className={`toggle-btn ${!darkMode ? 'active' : ''}`}
            onClick={() => handleThemeToggle('light')}
          >
            Light
          </button>
          <button
            className={`toggle-btn ${darkMode ? 'active' : ''}`}
            onClick={() => handleThemeToggle('dark')}
          >
            Dark
          </button>
        </div>

        {/* 📚 Story List */}
        <StoryList
          stories={stories}
          onPlay={handlePlayStory}
          setSelectedStory={setSelectedStory}
          setShowImageSelector={setShowImageSelector}
        />



        {selectedStory && (
          <div className="story-content-view" style={{ marginTop: '30px', backgroundColor: '#f4f4f4', padding: '20px', borderRadius: '8px' }}>
            <img 
              src={getStoryImage()}
              alt="Selected Story Image" 
              onClick={() => setShowImageSelector(true)}
              style={{
                width: '100%',
                borderRadius: '12px',
                marginBottom: '15px',
                cursor: 'pointer',
                boxShadow: '0 0 10px rgba(0,0,0,0.2)',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />

            <h2>{selectedStory.title}</h2>
            <p><strong>Age:</strong> {selectedStory.age}</p>
            <p><strong>Genre:</strong> {selectedStory.genre}</p>
            <p><strong>Main Character:</strong> {selectedStory.character}</p>
            <p><strong>Story:</strong></p>
            <p>{selectedStory.content}</p>

            <button
              onClick={() => setShowImageSelector(true)}
              className="button button-primary"
              style={{ marginTop: '10px' }}
            >
              🎨 Change Image
            </button>

            <button
              onClick={() => setSelectedStory(null)}
              style={{ marginTop: '15px', backgroundColor: '#4b0082', color: 'white', padding: '8px 14px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Close Story
            </button>
          </div>
        )}

        {/* 🖼️ Image Selector Modal */}
        {showImageSelector && imageList.length > 0 && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <h2>Select Story Image</h2>
              <img
                src={imageList[currentImageIndex]}
                alt="Story Option"
                style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '10px' }}
              />

              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <button onClick={() => setCurrentImageIndex((prev) => (prev - 1 + imageList.length) % imageList.length)} className="button button-secondary">
                  ⬅ Previous
                </button>
                <button onClick={() => setCurrentImageIndex((prev) => (prev + 1) % imageList.length)} className="button button-secondary">
                  Next ➡
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={async () => {
                    if (!selectedStory) return;
                    try {
                      const storyRef = doc(firestoreDB, "stories", selectedStory.id);
                      await updateDoc(storyRef, {
                        customImage: imageList[currentImageIndex]
                      });
                      setSelectedStory(prev => ({
                        ...prev,
                        customImage: imageList[currentImageIndex]
                      }));
                      alert("✅ Story image updated!");
                    } catch (error) {
                      console.error("Error updating story image:", error);
                      alert("Failed to update story image.");
                    }
                    setShowImageSelector(false);
                  }}
                  className="button button-primary"
                >
                  Confirm
                </button>

                <button onClick={() => setShowImageSelector(false)} className="button button-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
