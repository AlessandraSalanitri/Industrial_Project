import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import StoryList from '../../components/StoryList';
import '../../styles/child_dashboard.css';
import { ThemeToggle } from '../../components/ThemeToggle';
import '../../styles/darkMode.css';
import { firebaseAuth, firestoreDB } from '../../firebase/firebaseConfig';
import { collection, getDoc, doc, query, where, getDocs } from 'firebase/firestore';

export default function ChildDashboard() {
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);

  //check wether the child account is a simulated account or a real account (to distinguish if should display exit child mode or not in the avatar)
  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(firestoreDB, 'users', currentUser.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
  
        const isSimulated = localStorage.getItem('mode') === 'child';
        const simulatedEmail = `${currentUser.email}-child@simulated.com`;
  
        const finalUser = {
          userId: currentUser.uid,
          email: isSimulated ? simulatedEmail : currentUser.email,
          role: isSimulated ? 'child' : userData.role || 'child',
          isSimulated,
          ...userData
        };
  
        setUser(finalUser);
      }
    });
  
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchStories();
    }
  }, [user]);


  const fetchStories = async () => {
    setIsLoading(true);
  
    try {
      const emailToCheck = user?.email;
  
      if (!emailToCheck) {
        console.warn("No child email available for fetching stories.");
        setIsLoading(false);
        return;
      }
  
      const linkedQuery = query(
        collection(firestoreDB, 'linkedAccounts'),
        where('childEmail', '==', emailToCheck)
      );
  
      const snapshot = await getDocs(linkedQuery);
      const parentIds = snapshot.docs.map(doc => doc.data().parentId);
  
      if (parentIds.length === 0) {
        console.log("There is no linked parents found, skipping story fetch.");
        setIsLoading(false);
        return;
      }
  
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
  

  const handlePlayStory = (story) => {
    setSelectedStory(story);
  };

  if (isLoading) {
    return <div>Loading stories...</div>;
  }

  return (
<Layout>
  <div className="child-dashboard">

    {/* --- New Dashboard Header --- */}
    <div className="dashboard-header">
      <h1 className="dashboard-title">Your Stories</h1>
        <ThemeToggle />
    </div>

    {/* --- Search and Filters are already inside StoryList --- */}
    <StoryList stories={stories} onPlay={handlePlayStory} />

    {selectedStory && (
      <div className="story-content-view">
        <h2>{selectedStory.title}</h2>
        <p><strong>Age:</strong> {selectedStory.age}</p>
        <p><strong>Genre:</strong> {selectedStory.genre}</p>
        <p><strong>Main Character:</strong> {selectedStory.character}</p>
        <p><strong>Story:</strong></p>
        <p>{selectedStory.content}</p>
        <button onClick={() => setSelectedStory(null)}>Close Story</button>
      </div>
    )}
  </div>
</Layout>
  );
}
