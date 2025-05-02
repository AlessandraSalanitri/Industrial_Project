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
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { firestoreDB } from '../../firebase/firebaseConfig';
import '../../styles/mystories.css';
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

  const isFiltered =
    filters.letter !== null || filters.genre !== null || filters.age !== null || viewFavourites;

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
      const ref = doc(firestoreDB, 'stories', updated.id);
      await updateDoc(ref, {
        title: updated.title,
        genre: updated.genre,
        age: updated.age,
        content: updated.content,
      });
      const snap = await getDocs(collection(firestoreDB, 'stories'));
      const userStories = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((s) => s.userId === user.uid);
      setStories(userStories);
      setSelectedStory(null);
      alert('Story updated successfully!');
    } catch (e) {
      console.error('Error updating story:', e);
      setErrorMessage('Failed to update story. Please try again!');
    }
  };

  const handleReadStory = (content) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(content);
    u.lang = 'en-GB';
    u.rate = 1;
    window.speechSynthesis.speak(u);
  };

  const handlePauseStory = () => window.speechSynthesis.pause();
  const handleResumeStory = () => window.speechSynthesis.resume();
  const handleStopStory = () => window.speechSynthesis.cancel();

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

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

  const handleClearFilters = () => {
    setFilters({ letter: null, genre: null, age: null });
    setViewFavourites(false);
  };

  const sortedStories = [...stories]
    .filter((s) => {
      const startsWith = !filters.letter || s.title?.[0]?.toUpperCase() === filters.letter;
      const matchesGenre = !filters.genre || s.genre === filters.genre;
      const matchesAge = !filters.age || s.age === filters.age;
      const matchesFav = !viewFavourites || s.favourite;
      return startsWith && matchesGenre && matchesAge && matchesFav;
    })
    .sort((a, b) => {
      const aVal = a[sortConfig.key] || '';
      const bVal = b[sortConfig.key] || '';
      return sortConfig.direction === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });

  const renderArrow = (key) => {
    const isActive = sortConfig.key === key;
    return (
      <span style={{ marginLeft: 4 }}>
        {isActive ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
      </span>
    );
  };

  return (
    <Layout>
      <div className="container">
        <h1>My Stories</h1>
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <div className="alphabet-filter">
          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => {
            const hasAny = stories.some((s) => s.title?.[0]?.toUpperCase() === letter);
            return (
              <button
                key={letter}
                type="button"
                onClick={() => setFilters((f) => ({ ...f, letter }))}
                className={`alphabet-btn ${hasAny ? 'primary' : ''}`}
              >
                {letter}
              </button>
            );
          })}
        </div>

        <div className="filters-actions">
          <label>
            Genre:
            <select
              value={filters.genre || ''}
              onChange={(e) => setFilters((f) => ({ ...f, genre: e.target.value || null }))}
            >
              <option value="">All</option>
              {[...new Set(stories.map((s) => s.genre))].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </label>

          <label>
            Age:
            <select
              value={filters.age || ''}
              onChange={(e) => setFilters((f) => ({ ...f, age: e.target.value || null }))}
            >
              <option value="">All</option>
              {[...new Set(stories.map((s) => s.age))].map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </label>

          <button
            className={`toggle-btn ${isFiltered ? 'secondary' : 'primary'}`}
            onClick={handleClearFilters}
          >
            {isFiltered ? 'Clear Filters' : 'Filter'}
          </button>

          <button
            className="toggle-btn primary favourites-toggle"
            onClick={() => setViewFavourites((v) => !v)}
          >
            {viewFavourites ? 'All Stories' : 'View Favourites'}
          </button>
        </div>

        <div className="select-delete-controls">
          <button className="toggle-btn secondary" onClick={toggleSelectAll}>
            {selectedStoryIds.length === sortedStories.length ? 'Deselect All' : 'Select All'}
          </button>
          <button
            className="toggle-btn primary"
            onClick={handleDeleteSelected}
            disabled={selectedStoryIds.length === 0}
          >
            🗑
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedStoryIds.length === sortedStories.length && sortedStories.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>
                Title {renderArrow('title')}
              </th>
              <th onClick={() => handleSort('age')} style={{ cursor: 'pointer' }}>
                Age {renderArrow('age')}
              </th>
              <th onClick={() => handleSort('genre')} style={{ cursor: 'pointer' }}>
                Genre {renderArrow('genre')}
              </th>
              <th onClick={() => handleSort('character')} style={{ cursor: 'pointer' }}>
                Character {renderArrow('character')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedStories.length === 0 ? (
              <tr><td colSpan="6">No stories found. Try changing filters.</td></tr>
            ) : (
              sortedStories.map((story) => (
                <tr key={story.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedStoryIds.includes(story.id)}
                      onChange={() => toggleSelect(story.id)}
                    />
                  </td>
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
              ))
            )}
          </tbody>
        </table>

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
