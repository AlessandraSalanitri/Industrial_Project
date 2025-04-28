// Final cleaned up `my-stories.js` ✅
import Layout from '../../components/Layout';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { firestoreDB } from '../../firebase/firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import '../../styles/mystories.css';
import StoryEditorModal from '../../components/StoryEditorModal';

export default function MyStories() {
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [modalMode, setModalMode] = useState('view');
  const [filters, setFilters] = useState({ letter: null, genre: null, age: null });
  const [user, setUser] = useState(null);
  const [viewFavourites, setViewFavourites] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchStories = async () => {
      const snapshot = await getDocs(collection(firestoreDB, 'stories'));
      const userStories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(story => story.userId === user.uid);
      setStories(userStories);
    };
    fetchStories();
  }, [user]);

  const filteredStories = stories.filter(story => {
    const startsWithLetter = !filters.letter || story.title?.[0]?.toUpperCase() === filters.letter;
    const matchesGenre = !filters.genre || story.genre === filters.genre;
    const matchesAge = !filters.age || story.age === filters.age;
    const matchesFavourite = !viewFavourites || story.favourite;
    return startsWithLetter && matchesGenre && matchesAge && matchesFavourite;
  });

  const handleDeleteStory = async (id) => {
    try {
      await deleteDoc(doc(firestoreDB, 'stories', id));
      const snapshot = await getDocs(collection(firestoreDB, 'stories'));
      const userStories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(story => story.userId === user.uid);
      setStories(userStories);
      alert('Story deleted successfully!');
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('Failed to delete the story. Please try again.');
    }
  };

  const handleToggleFavourite = async (storyId, currentFavouriteStatus) => {
    try {
      const storyRef = doc(firestoreDB, 'stories', storyId);
      const newFavouriteStatus = !currentFavouriteStatus;
      await updateDoc(storyRef, { favourite: newFavouriteStatus });

      setStories(prevStories =>
        prevStories.map(story =>
          story.id === storyId ? { ...story, favourite: newFavouriteStatus } : story
        )
      );
    } catch (error) {
      console.error('Error updating favourite status:', error);
      alert('Failed to update the favourite status. Please try again.');
    }
  };

  async function handleUpdateStory(updatedStory) {
    try {
      const storyRef = doc(firestoreDB, 'stories', updatedStory.id);
      await updateDoc(storyRef, {
        title: updatedStory.title,
        genre: updatedStory.genre,
        age: updatedStory.age,
        content: updatedStory.content,
      });

      const snapshot = await getDocs(collection(firestoreDB, 'stories'));
      const userStories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(story => story.userId === user.uid);
      setStories(userStories);

      setSelectedStory(null);
      alert("Story updated successfully!");
    } catch (error) {
      console.error("Error updating story:", error);
      alert("Failed to update story. Please try again!");
    }
  }

  function handleReadStory(content) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = 'en-GB';
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  }

  function handlePauseStory() {
    window.speechSynthesis.pause();
  }

  function handleResumeStory() {
    window.speechSynthesis.resume();
  }

  function handleStopStory() {
    window.speechSynthesis.cancel();
  }

  return (
    <Layout>
      <div className="container">
        <h1>My Stories</h1>

        {/* Filters */}
        <div className="alphabet-filter">
          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
            <button
              key={letter}
              onClick={() => setFilters(prev => ({ ...prev, letter }))}
              disabled={!stories.some(s => s.title?.startsWith(letter))}
              className={filters.letter === letter ? 'active' : ''}
            >{letter}</button>
          ))}
        </div>

        <div className="additional-filters">
          <label>Genre:
            <select value={filters.genre || ''} onChange={e => setFilters(prev => ({ ...prev, genre: e.target.value || null }))}>
              <option value="">All</option>
              {[...new Set(stories.map(s => s.genre))].map(g => <option key={g}>{g}</option>)}
            </select>
          </label>
          <label>Age:
            <select value={filters.age || ''} onChange={e => setFilters(prev => ({ ...prev, age: e.target.value || null }))}>
              <option value="">All</option>
              {[...new Set(stories.map(s => s.age))].map(a => <option key={a}>{a}</option>)}
            </select>
          </label>

          <button onClick={() => setFilters({ letter: null, genre: null, age: null })} className="reset-btn">Clear Filters</button>

          <div className="view-favourites-toggle">
            <button
              className={`toggle-btn ${viewFavourites ? 'secondary' : 'primary'}`}
              onClick={() => setViewFavourites(prev => !prev)}
            >
              {viewFavourites ? 'All Stories' : 'View Favourites'}
            </button>
          </div>
        </div>

        {/* Story Table */}
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Title</th>
              <th>Age</th>
              <th>Genre</th>
              <th>Character</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStories.map((story, i) => (
              <tr key={story.id}>
                <td>{i + 1}</td>
                <td>{story.title}</td>
                <td>{story.age}</td>
                <td>{story.genre}</td>
                <td>{story.character}</td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => { setSelectedStory(story); setModalMode('view'); }}>View</button>
                    <button onClick={() => { setSelectedStory(story); setModalMode('edit'); }}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDeleteStory(story.id)}>Delete</button>
                    <button
                      className="favourite-btn"
                      onClick={() => handleToggleFavourite(story.id, story.favourite)}
                      title={story.favourite ? 'Remove from favourites' : 'Add to favourites'}
                      style={{ background: 'none', border: 'none' }}
                    >
                      {story.favourite ? '❤️' : '🤍'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal */}
        <StoryEditorModal
          isOpen={!!selectedStory}
          mode={modalMode}
          story={selectedStory}
          onClose={() => { setSelectedStory(null); handleStopStory(); }}
          onSave={handleUpdateStory}
          onRead={handleReadStory}
          onPause={handlePauseStory}
          onResume={handleResumeStory}
          onStop={handleStopStory}
        />

        <button className="button button-secondary back-button" onClick={() => router.push('/')}>Back</button>
      </div>
    </Layout>
  );
}
