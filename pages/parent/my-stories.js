import Layout from '../../components/Layout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  addDoc,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { firestoreDB } from '../../firebase/firebaseConfig';
import '../../styles/mystories.css';
import { speakWithUserVoice } from '../../utils/tts';
import StoryEditorModal from '../../components/StoryEditorModal';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

export default function MyStories() {
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [modalMode, setModalMode] = useState('view');
  const [filters, setFilters] = useState({ letter: null, genre: null, age: null });
  const [user, setUser] = useState(null);
  const [viewFavourites, setViewFavourites] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'asc' });
  const [selectedStoryIds, setSelectedStoryIds] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), setUser);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDocs(collection(firestoreDB, 'stories'));
        const userStories = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((s) => s.userId === user.uid);
        setStories(userStories);
      } catch (e) {
        console.error('Error fetching stories:', e);
        setErrorMessage('Failed to load your stories. Please try again later.');
      }
    })();
  }, [user]);

  const handleCreateStory = () => router.push('/parent/create-story');

  const handleDeleteStory = async (id) => {
    try {
      await deleteDoc(doc(firestoreDB, 'stories', id));
      setStories((prev) => prev.filter((s) => s.id !== id));
      setSelectedStoryIds((prev) => prev.filter((sid) => sid !== id));
      alert('Story deleted successfully!');
    } catch (e) {
      console.error('Error deleting story:', e);
      setErrorMessage('Failed to delete the story. Please try again.');
    }
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm('Are you sure you want to delete selected stories?')) return;
    try {
      await Promise.all(selectedStoryIds.map((id) => deleteDoc(doc(firestoreDB, 'stories', id))));
      setStories((prev) => prev.filter((s) => !selectedStoryIds.includes(s.id)));
      setSelectedStoryIds([]);
      alert('Selected stories deleted!');
    } catch (e) {
      console.error('Error deleting selected stories:', e);
      setErrorMessage('Failed to delete some stories. Try again.');
    }
  };

  const handleToggleFavourite = async (storyId, currentStatus) => {
    try {
      const storyRef = doc(firestoreDB, 'stories', storyId);
      const snap = await getDoc(storyRef);
      if (!snap.exists()) return setErrorMessage('Story not found; please refresh.');
      await updateDoc(storyRef, { favourite: !currentStatus });
      setStories((prev) =>
        prev.map((s) => (s.id === storyId ? { ...s, favourite: !currentStatus } : s))
      );
      alert(`Story ${!currentStatus ? 'added to' : 'removed from'} favourites`);
    } catch (e) {
      console.error('Error toggling favourite:', e);
      setErrorMessage('Could not update favourite. Please try again.');
    }
  };

  const handleUpdateStory = async (updated) => {
    try {
      if (modalMode === 'create') {
        await addDoc(collection(firestoreDB, 'stories'), {
          ...updated,
          userId: user.uid,
          favourite: false,
        });
      } else {
        const ref = doc(firestoreDB, 'stories', updated.id);
        await updateDoc(ref, updated);
      }

      const snap = await getDocs(collection(firestoreDB, 'stories'));
      const userStories = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((s) => s.userId === user.uid);
      setStories(userStories);
      setSelectedStory(null);
      alert(`Story ${modalMode === 'create' ? 'created' : 'updated'} successfully!`);
    } catch (e) {
      console.error('Error saving story:', e);
      setErrorMessage(`Failed to ${modalMode === 'create' ? 'create' : 'update'} story. Please try again!`);
    }
  };

  const handleReadStory = (content) => speakWithUserVoice(content);
  const handlePauseStory = () => window.speechSynthesis.pause();
  const handleResumeStory = () => window.speechSynthesis.resume();
  const handleStopStory = () => window.speechSynthesis.cancel();

  const toggleSelect = (id) => {
    setSelectedStoryIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedStoryIds.length === sortedStories.length) {
      setSelectedStoryIds([]);
    } else {
      setSelectedStoryIds(sortedStories.map((s) => s.id));
    }
  };

  const sortedStories = [...stories].filter((s) => {
    const startsWith = !filters.letter || s.title?.[0]?.toUpperCase() === filters.letter;
    const matchesGenre = !filters.genre || s.genre === filters.genre;
    const matchesAge = !filters.age || s.age === filters.age;
    const matchesFav = !viewFavourites || s.favourite;
    return startsWith && matchesGenre && matchesAge && matchesFav;
  });

  return (
    <Layout>
      <div className="container">
        <h1 className="title">My Stories</h1>
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <div className="select-delete-controls">
          <button className="toggle-btn secondary" onClick={toggleSelectAll}>
            {selectedStoryIds.length === sortedStories.length ? 'Deselect All' : 'Select All'}
          </button>
          <button
            className="delete-selected-btn"
            onClick={handleDeleteSelected}
            disabled={selectedStoryIds.length === 0}
          >
            🗑
          </button>
          <button
            className="create-story-btn"
            onClick={handleCreateStory}
          >
            +
          </button>
        </div>

        <table className="story-table desktop-only">
          <thead>
            <tr>
              <th style={{ width: '10px', padding: '0', margin: '0', textAlign: 'left' }}><input type="checkbox" onChange={toggleSelectAll} checked={selectedStoryIds.length === sortedStories.length} /></th>
              <th>#</th>
              <th>Title</th>
              <th>Age</th>
              <th>Genre</th>
              <th>Character</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedStories.map((story, index) => (
              <tr key={story.id}>
                <td style={{ width: '1%', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={selectedStoryIds.includes(story.id)}
                    onChange={() => toggleSelect(story.id)}
                  />
                </td>
                <td>{index + 1}</td>
                <td>{story.title}</td>
                <td>{story.age}</td>
                <td>{story.genre}</td>
                <td>{story.character}</td>
                <td className="action-buttons">
                  <button onClick={() => { setSelectedStory(story); setModalMode('view'); }}>View</button>
                  <button onClick={() => { setSelectedStory(story); setModalMode('edit'); }}>Edit</button>
                  <button className="bin-btn" onClick={() => handleDeleteStory(story.id)}>🗑</button>
                  <button
                    className={`favourite-btn ${story.favourite ? 'favourite-active' : ''}`}
                    onClick={() => handleToggleFavourite(story.id, story.favourite)}
                  >
                    {story.favourite ? <FaHeart /> : <FaRegHeart />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mobile-story-cards mobile-only">
          {sortedStories.map((story, index) => (
            <div className="story-card-mobile" key={story.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={selectedStoryIds.includes(story.id)}
                  onChange={() => toggleSelect(story.id)}
                />
                <strong>#{index + 1}</strong>
              </div>
              <p><strong>Title:</strong> {story.title}</p>
              <p><strong>Age:</strong> {story.age}</p>
              <p><strong>Genre:</strong> {story.genre}</p>
              <p><strong>Character:</strong> {story.character}</p>
              <div className="action-buttons">
                <button onClick={() => { setSelectedStory(story); setModalMode('view'); }}>View</button>
                <button onClick={() => { setSelectedStory(story); setModalMode('edit'); }}>Edit</button>
                <button className="bin-btn" onClick={() => handleDeleteStory(story.id)}>🗑</button>
                <button
                  className={`favourite-btn ${story.favourite ? 'favourite-active' : ''}`}
                  onClick={() => handleToggleFavourite(story.id, story.favourite)}
                >
                  {story.favourite ? <FaHeart /> : <FaRegHeart />}
                </button>
              </div>
            </div>
          ))}
        </div>

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
