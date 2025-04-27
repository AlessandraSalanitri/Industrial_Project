import Layout from '../../components/Layout';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { firestoreDB } from '../../firebase/firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { MoonStars } from 'phosphor-react';
import '../../styles/mystories.css';

export default function MyStories() {
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [filters, setFilters] = useState({ letter: null, genre: null, age: null });
  const [user, setUser] = useState(null);
  const [noFavouritesFound, setNoFavouritesFound] = useState(false);
  const [viewFavourites, setViewFavourites] = useState(false);  // New state to track favourite filter
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel(); // Stop any ongoing speech if exiting the page
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
    const matchesFavourite = !viewFavourites || story.favourite;  // Apply favourite filter if viewFavourites is true
    return startsWithLetter && matchesGenre && matchesAge && matchesFavourite;
  });

  const favouriteStories = stories.filter(story => story.favourite);

  const handleDeleteStory = async (id) => {
    try {
      await deleteDoc(doc(firestoreDB, 'stories', id)); // Delete the story from Firestore
      console.log(`Deleted story with ID: ${id}`);

      // Re-fetch stories to ensure database and UI are fully in sync
      const snapshot = await getDocs(collection(firestoreDB, 'stories'));
      const userStories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(story => story.userId === user.uid);

      setStories(userStories); // Update the stories with fresh data

      alert('Story deleted successfully!');
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('Failed to delete the story. Please try again.');
    }
  };

  const handleToggleFavourite = async (storyId, currentFavouriteStatus) => {
    try {
      const storyRef = doc(firestoreDB, 'stories', storyId);
      const newFavouriteStatus = !currentFavouriteStatus; // Toggle favourite status

      await updateDoc(storyRef, { favourite: newFavouriteStatus });

      // Optimistic UI update: Update the local state immediately
      setStories(prevStories =>
        prevStories.map(story =>
          story.id === storyId ? { ...story, favourite: newFavouriteStatus } : story
        )
      );

      console.log(`Favourite status updated for storyId: ${storyId}`);
    } catch (error) {
      console.error('Error updating favourite status:', error);
      alert('Failed to update the favourite status. Please try again.');
    }
  };

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

  useEffect(() => {
    if (favouriteStories.length === 0) {
      setNoFavouritesFound(true);
    } else {
      setNoFavouritesFound(false);
    }
  }, [favouriteStories]);

  return (
    <Layout>
      <div className="container">
        <h1>My Stories</h1>

        {/* Alphabet Filter */}
        <div className="alphabet-filter">
          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
            <button
              key={letter}
              onClick={() => setFilters(prev => ({ ...prev, letter }))}
              disabled={!stories.some(s => s.title?.startsWith(letter))}
              className={filters.letter === letter ? 'active' : ''}
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Dropdown Filters */}
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

          {/* Clear Filters and Toggle Button */}
          <button onClick={() => {
            if (filters.letter || filters.genre || filters.age) {
              setFilters({ letter: null, genre: null, age: null }); // Clear filters
            } else {

            }
          }}
          className={`toggle-btn ${filters.letter || filters.genre || filters.age ? 'active' : ''}`}
        >
          {filters.letter || filters.genre || filters.age ? 'Clear Filters' : 'Filter'}
        </button>

          <div className="view-favourites-toggle">
            <button
              className={`toggle-btn ${viewFavourites ? 'secondary' : 'primary'}`}
              onClick={() => setViewFavourites(prev => !prev)}
            >
              {viewFavourites ? 'All Stories' : 'View Favourites'}
            </button>
          </div>
        </div>

        {/* Table */}
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
                    {/* Heart icon toggle */}
                    <button
                      className="favourite-btn"
                      onClick={() => handleToggleFavourite(story.id, story.favourite)}
                      title={story.favourite ? 'Remove from favourites' : 'Add to favourites'}
                      style={{ background: 'none', border: 'none' }}
                    >
                      {story.favourite ? '❤️' : '🤍'}
                    </button>
                    <button className="button button-primary" onClick={() => setSelectedStory(story)}>View</button>
                    <Link href={{ pathname: '/parent/edit-story', query: { id: story.id } }}>
                      <button className="button button-primary">Edit</button>
                    </Link>
                    <button className="delete-btn" onClick={() => handleDeleteStory(story.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selectedStory && (
          <div className="story-content">
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button onClick={() => setSelectedStory(null)} className="button button-secondary">Close</button>
              <button onClick={() => handleReadStory(selectedStory.content)} className="button button-primary">▶ Read Story</button>
              <button onClick={handlePauseStory} className="button button-secondary">⏸ Pause</button>
              <button onClick={handleResumeStory} className="button button-secondary">▶ Resume</button>
              <button onClick={handleStopStory} className="button button-secondary">⏹ Stop</button>
            </div>
            <div className="story-title">
              <MoonStars size={28} weight="fill" style={{ color: '#4B0082', marginRight: '8px' }} />
              <strong>{selectedStory.title.replace(/\*\*/g, '')}</strong>
            </div>
            <p><strong>Age:</strong> {selectedStory.age}</p>
            <p><strong>Genre:</strong> {selectedStory.genre}</p>
            <p><strong>Main Character:</strong> {selectedStory.character}</p>
            <div className="story-paragraphs">
              {selectedStory.source === "ai"
                ? selectedStory.content?.split('\n\n').slice(1).map((para, i) => <p key={i}>{para}</p>)
                : selectedStory.content?.split('\n\n').map((para, i) => <p key={i}>{para}</p>)
              }
            </div>
          </div>
        )}

        <button className="button button-secondary back-button" onClick={() => router.push('/')}>
          Back
        </button>
      </div>
    </Layout>
  );
}
