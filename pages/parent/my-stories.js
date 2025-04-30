import Layout from '../../components/Layout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { firestoreDB } from '../../firebase/firebaseConfig';
import '../../styles/mystories.css';
import StoryEditorModal from '../../components/StoryEditorModal';
import { FaHeart, FaRegHeart } from 'react-icons/fa'; // Import heart icons from React Icons

export default function MyStories() {
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [modalMode, setModalMode] = useState('view');
  const [filters, setFilters] = useState({ letter: null, genre: null, age: null });
  const [user, setUser] = useState(null);
  const [viewFavourites, setViewFavourites] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), setUser);
    return unsubscribe;
  }, []);

  // Fetch stories for this user
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDocs(collection(firestoreDB, 'stories'));
        const userStories = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(s => s.userId === user.uid); // Filtering based on userId
        setStories(userStories);
      } catch (e) {
        console.error('Error fetching stories:', e);
        setErrorMessage('Failed to load your stories. Please try again later.');
      }
    })();
  }, [user]);

  // Filtered stories based on filters
  const filteredStories = stories.filter(story => {
    const startsWith = !filters.letter || story.title?.[0]?.toUpperCase() === filters.letter;
    const matchesGenre = !filters.genre || story.genre === filters.genre;
    const matchesAge = !filters.age || story.age === filters.age;
    const matchesFav = !viewFavourites || story.favourite; // Only show favourites if viewFavourites is true
    return startsWith && matchesGenre && matchesAge && matchesFav;
  });

  // Delete handler
  const handleDeleteStory = async id => {
    try {
      const storyRef = doc(firestoreDB, 'stories', id);
      await deleteDoc(storyRef);
      setStories(prev => prev.filter(s => s.id !== id)); // Update UI immediately
      alert('Story deleted successfully!');
    } catch (e) {
      console.error('Error deleting story:', e);
      setErrorMessage('Failed to delete the story. Please try again.');
    }
  };

  // Toggle favourite with existence check
  const handleToggleFavourite = async (storyId, currentStatus) => {
    try {
      const storyRef = doc(firestoreDB, 'stories', storyId);
      const snap = await getDoc(storyRef);

      if (!snap.exists()) {
        setErrorMessage('Story not found; please refresh.');
        return;
      }

      // Update the favourite status in Firestore
      await updateDoc(storyRef, { favourite: !currentStatus });

      // Update the UI state to reflect the change immediately
      setStories(prev => prev.map(s => 
        s.id === storyId ? { ...s, favourite: !currentStatus } : s
      ));

      alert(`Story ${!currentStatus ? 'added to' : 'removed from'} favourites`);
    } catch (e) {
      console.error('Error toggling favourite:', e);
      setErrorMessage('Could not update favourite. Please try again.');
    }
  };

  // Update story handler
  const handleUpdateStory = async updated => {
    try {
      const ref = doc(firestoreDB, 'stories', updated.id);
      await updateDoc(ref, {
        title: updated.title,
        genre: updated.genre,
        age: updated.age,
        content: updated.content
      });

      // Re-fetch the stories after the update
      const snap = await getDocs(collection(firestoreDB, 'stories'));
      const userStories = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(s => s.userId === user.uid);
      setStories(userStories);
      setSelectedStory(null);
      alert('Story updated successfully!');
    } catch (e) {
      console.error('Error updating story:', e);
      setErrorMessage('Failed to update story. Please try again!');
    }
  };

  // Text-to-speech handlers
  const handleReadStory = content => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(content);
    u.lang = 'en-GB';
    u.rate = 1;
    window.speechSynthesis.speak(u);
  };
  const handlePauseStory = () => window.speechSynthesis.pause();
  const handleResumeStory = () => window.speechSynthesis.resume();
  const handleStopStory = () => window.speechSynthesis.cancel();

  return (
    <Layout>
      <div className="container">
        <h1>My Stories</h1>
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        {/* Alphabet Filter */}
        <div className="alphabet-filter">
          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => {
            const hasAny = stories.some(s => s.title?.[0]?.toUpperCase() === letter);
            return (
              <button
                key={letter}
                type="button"
                onClick={() => setFilters(f => ({ ...f, letter }))}
                className={`alphabet-btn ${hasAny ? 'primary' : ''}`}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {/* Other Filters */}
        <div className="additional-filters">
          <label>
            Genre:
            <select value={filters.genre || ''} onChange={e => setFilters(f => ({ ...f, genre: e.target.value || null }))}>
              <option value="">All</option>
              {[...new Set(stories.map(s => s.genre))].map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </label>

          <label>
            Age:
            <select value={filters.age || ''} onChange={e => setFilters(f => ({ ...f, age: e.target.value || null }))}>
              <option value="">All</option>
              {[...new Set(stories.map(s => s.age))].map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </label>

          <button
            className={`toggle-btn ${filters.letter || filters.genre || filters.age ? 'primary' : 'secondary'}`}
            onClick={() => setFilters({ letter: null, genre: null, age: null })}
          >
            Clear Filters
          </button>


          <button className={`toggle-btn ${viewFavourites ? 'secondary' : 'primary'}`} onClick={() => setViewFavourites(v => !v)}>
            {viewFavourites ? 'All Stories' : 'View Favourites'}
          </button>
        </div>

        {/* Story Table */}
        <table>
          <thead>
            <tr>
              <th>#</th><th>Title</th><th>Age</th><th>Genre</th><th>Character</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStories.length === 0 ? (
              <tr><td colSpan="6">No stories found. Try changing filters.</td></tr>
            ) : filteredStories.map((story, i) => (
              <tr key={story.id}>
                <td>{i + 1}</td>
                <td>{story.title}</td>
                <td>{story.age}</td>
                <td>{story.genre}</td>
                <td>{story.character}</td>
                <td className="action-buttons">
                  <button onClick={() => { setSelectedStory(story); setModalMode('view'); }}>View</button>
                  <button className="edit-btn" onClick={() => { setSelectedStory(story); setModalMode('edit'); }}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDeleteStory(story.id)}>Delete</button>
                  <button
                    type="button"
                    className={`favourite-btn ${story.favourite ? 'favourite-active' : ''}`}
                    onClick={() => handleToggleFavourite(story.id, story.favourite)}
                    aria-label={story.favourite ? 'Remove from favourites' : 'Add to favourites'}
                  >
                    {story.favourite ? (
                      <FaHeart size={24} color="red" /> // Red heart when favourite
                    ) : (
                      <FaRegHeart size={24} color="gray" /> // Empty heart when not favourite
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Editor Modal */}
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

        <button className="button button-secondary back-button" onClick={() => router.push('/')}>
          Back
        </button>
      </div>
    </Layout>
  );
}
