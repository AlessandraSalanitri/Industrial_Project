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
import AlertModal from '../../components/AlertModal';


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
  const [showAlertModal, setShowAlertModal] = useState(null); // for confirm + success


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
    setShowAlertModal({
      type: "success",
      title: "STORY DELETED",
      message: "The story has been successfully deleted.",
      onConfirm: () => setShowAlertModal(null),
      confirmLabel: "OK",
      emoji: "🎉"
    });
  } catch (e) {
    console.error('Error deleting story:', e);
    setErrorMessage('Failed to delete the story. Please try again.');
  }
};


const handleDeleteSelected = () => {
  setShowAlertModal({
    title: "DELETE SELECTED?",
    message: "Are you sure you want to permanently delete the selected stories?",
    emoji: "🚨",
    onConfirm: async () => {
      try {
        await Promise.all(selectedStoryIds.map((id) => deleteDoc(doc(firestoreDB, 'stories', id))));
        setStories((prev) => prev.filter((s) => !selectedStoryIds.includes(s.id)));
        setSelectedStoryIds([]);
        setShowAlertModal({
          type: "success",
          title: "STORIES DELETED",
          message: "Selected stories were deleted successfully.",
          emoji: "🎉",
          onConfirm: () => setShowAlertModal(null),
          confirmLabel: "OK"
        });
      } catch (e) {
        console.error('Error deleting selected stories:', e);
        setShowAlertModal({
          type: "error",
          title: "Oops!",
          message: "Failed to delete some stories. Please try again.",
          confirmLabel: "OK",
          onConfirm: () => setShowAlertModal(null)
        });
      }
    },
    onClose: () => setShowAlertModal(null),
    confirmLabel: "Yes",
    cancelLabel: "No"
  });
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

      // ✅ No message shown here
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

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const renderArrow = (key) => {
    const isActive = sortConfig.key === key;
    return (
      <span style={{ marginLeft: 4 }}>
        {isActive ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
      </span>
    );
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

  return (
      <Layout>
        <div className="container">
          <h1 className="title">My Stories</h1>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
  
          {/* Alphabet Filter */}
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
  
          {/* Inline Filters */}
          <div className="inline-filters">
            <select
              value={filters.age || ''}
              onChange={(e) => setFilters((f) => ({ ...f, age: e.target.value || null }))}
            >
              <option value="">All Ages</option>
              {[...new Set(stories.map((s) => s.age).filter(Boolean))].map((ageOption) => (
                <option key={ageOption} value={ageOption}>{ageOption}</option>
              ))}
            </select>
  
            <select
              value={filters.genre || ''}
              onChange={(e) => setFilters((f) => ({ ...f, genre: e.target.value || null }))}
            >
              <option value="">All Genres</option>
              {[...new Set(stories.map((s) => s.genre).filter(Boolean))].map((genreOption) => (
                <option key={genreOption} value={genreOption}>{genreOption}</option>
              ))}
            </select>
  
            <button
              className={`toggle-btn ${filters.age || filters.genre || filters.letter ? 'primary' : 'secondary'} spaced-button`}
              onClick={() => setFilters({ letter: null, genre: null, age: null })}
            >
              {filters.age || filters.genre || filters.letter ? 'Clear Filter' : 'Filter'}
            </button>
          </div>
  
          {/* View Favourites Button - Right Aligned */}
          <div className="view-favourites-toggle" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="toggle-btn primary"
              onClick={() => setViewFavourites((v) => !v)}
            >
              {viewFavourites ? '❤ Show All Stories' : '❤️ View Favourites'}
            </button>
          </div>
  
          {/* No Stories Found Message */}
          {sortedStories.length === 0 ? (
            <p style={{ marginTop: '2rem', textAlign: 'center', color: '#555' }}>
              No stories found, please change your selection.
            </p>
          ) : (
            <>
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
                <button className="create-story-btn" onClick={handleCreateStory}>+</button>
              </div>
  
              {/* Desktop Table */}
              <table className="story-table desktop-only">
                <thead>
                  <tr>
                    <th style={{ width: '30px', padding: 0, textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        onChange={toggleSelectAll}
                        checked={selectedStoryIds.length === sortedStories.length}
                      />
                    </th>
                    <th>#</th>
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
                  {sortedStories.map((story, index) => (
                    <tr key={story.id}>
                      <td style={{ width: '30px', textAlign: 'center' }}>
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
  
              {/* Mobile Cards */}
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
            </>
          )}
  
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
  
          {showAlertModal && (
            <AlertModal
              type={showAlertModal.type}
              title={showAlertModal.title}
              message={showAlertModal.message}
              onConfirm={showAlertModal.onConfirm}
              onClose={showAlertModal.onClose}
              confirmLabel={showAlertModal.confirmLabel}
              cancelLabel={showAlertModal.cancelLabel}
            />
          )}
        </div>
      </Layout>
    );
}


