import Layout from '../../components/Layout';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { firestoreDB } from '../../firebase/firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function MyStories() {
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [filterLetter, setFilterLetter] = useState(null);
  const [genreFilter, setGenreFilter] = useState(null);
  const [ageFilter, setAgeFilter] = useState(null);
  const [audio, setAudio] = useState(null);
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  
    return () => unsubscribe();
  }, []);

  useEffect(() => {
  const fetchStories = async () => {
    if (!user) return; // wait for user to load

    try {
      const querySnapshot = await getDocs(collection(firestoreDB, 'stories'));
      const storiesData = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((story) => story.userId === user.uid); // filter by current user

      setStories(storiesData);
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  };

  fetchStories();
  }, [user]);

  const handleSelectStory = (story) => {
    setSelectedStory(story);
  };

  const handleCloseStory = () => {
    setSelectedStory(null);
    window.speechSynthesis.cancel();
  };

  const handleReadStory = () => {
    if (!selectedStory?.content) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(selectedStory.content);
    utterance.lang = 'en-GB'; // British English
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };

  const handleBack = () => {
    router.push('/');
  };

  const handleDeleteStory = async (id) => {
    try {
      await deleteDoc(doc(firestoreDB, 'stories', id));
      setStories(stories.filter((story) => story.id !== id));
    } catch (error) {
      console.error('Error deleting story:', error);
    }
  };

  const handleClearFilters = () => {
    setFilterLetter(null);
    setGenreFilter(null);
    setAgeFilter(null);
  };

  const handlePlayAudio = (audioUrl) => {
    setAudio(audioUrl);
  };

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const availableLetters = new Set(
    stories.map((s) => s.title?.[0]?.toUpperCase()).filter(Boolean)
  );

  let filteredStories = stories;

  if (filterLetter) {
    filteredStories = filteredStories.filter(
      (story) => story.title?.[0]?.toUpperCase() === filterLetter
    );
  }

  if (genreFilter) {
    filteredStories = filteredStories.filter((story) => story.genre === genreFilter);
  }

  if (ageFilter) {
    filteredStories = filteredStories.filter((story) => story.age === ageFilter);
  }

  return (
    <Layout>
      <div className="container">
        <h1>My Stories</h1>
        <p className="subtitle"></p>

        <div className="alphabet-filter">
          {alphabet.map((letter) => (
            <button
              key={letter}
              onClick={() => setFilterLetter(letter)}
              disabled={!availableLetters.has(letter)}
              className={filterLetter === letter ? 'active' : ''}
            >
              {letter}
            </button>
          ))}
        </div>

        <div className="additional-filters">
          <label>
            Genre:
            <select
              value={genreFilter || ''}
              onChange={(e) => setGenreFilter(e.target.value || null)}
            >
              <option value="">All</option>
              {[...new Set(stories.map((s) => s.genre))].map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </label>

          <label>
            Age:
            <select
              value={ageFilter || ''}
              onChange={(e) => setAgeFilter(e.target.value || null)}
            >
              <option value="">All</option>
              {[...new Set(stories.map((s) => s.age))].map((age) => (
                <option key={age} value={age}>
                  {age}
                </option>
              ))}
            </select>
          </label>

          <button onClick={handleClearFilters} className="reset-btn">
            Clear Filters
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Age</th>
              <th>Genre</th>
              <th>Main Character</th>
              <th>Actions</th>
              <th>Audio</th>
            </tr>
          </thead>
          <tbody>
            {filteredStories.length > 0 ? (
              filteredStories.map((story, index) => (
                <tr key={story.id}>
                  <td>{index + 1}</td>
                  <td>{story.title}</td>
                  <td>{story.age}</td>
                  <td>{story.genre}</td>
                  <td>{story.character}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => handleSelectStory(story)}>View</button>
                      <Link href={`/parent/edit-story?id=${story.id}`}>
                        <button>Edit</button>
                      </Link>
                      <button onClick={() => handleDeleteStory(story.id)} className="delete-btn">
                        Delete
                      </button>
                    </div>
                  </td>
                  <td>
                    {story.audio ? (
                      <button onClick={() => handlePlayAudio(story.audio)}>
                        Listen
                      </button>
                    ) : (
                      <span>No Audio</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>
                  No stories found{filterLetter ? ` for letter "${filterLetter}"` : ''}.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {selectedStory && (
          <div className="story-content">
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button onClick={handleCloseStory}>Close Story</button>
              <button onClick={handleReadStory}>Read Story</button>
            </div>
            <h2>{selectedStory.title}</h2>
            <p><strong>Age:</strong> {selectedStory.age}</p>
            <p><strong>Genre:</strong> {selectedStory.genre}</p>
            <p><strong>Main Character:</strong> {selectedStory.character}</p>
            <p><strong>Story Content:</strong></p>
            <p>{selectedStory.content}</p>
          </div>
        )}

        {audio && (
          <div className="audio-player">
            <audio controls>
              <source src={audio} type="audio/mp3" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        <button onClick={handleBack} className="back-button">
          Back
        </button>
      </div>

      <style jsx>{`
        .container {
          padding: 20px;
          width: fit-content;
          max-width: 100%;
          margin: 0 auto;
        }

        .subtitle {
          font-size: 1rem;
          color: #555;
          margin-bottom: 10px;
        }

        .alphabet-filter {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin: 10px 0 20px 0;
        }

        .alphabet-filter button {
          padding: 6px 10px;
          font-size: 0.85rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          background-color: #4b0082;
          color: white;
        }

        .alphabet-filter button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .alphabet-filter button.active {
          background-color: #3e0062;
        }

        .additional-filters {
          display: flex;
          gap: 12px;
          align-items: flex-end;
          margin-bottom: 20px;
        }

        .additional-filters label {
          display: flex;
          flex-direction: column;
          font-size: 0.9rem;
        }

        .additional-filters select {
          padding: 5px;
          border-radius: 4px;
          border: 1px solid #ccc;
        }

        .reset-btn {
          align-self: flex-end;
          padding: 6px 12px;
          border: none;
          background-color: #888;
          color: white;
          border-radius: 4px;
          cursor: pointer;
          height: fit-content;
        }

        .reset-btn:hover {
          background-color: #4b0082;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }

        th, td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
          word-break: break-word;
        }

        th {
          background-color: #4b0082;
          color: white;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .action-buttons button {
          padding: 6px 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          background-color: #4b0082;
          color: white;
          font-size: 0.85rem;
        }

        .action-buttons button:hover {
          background-color: #3e0062;
        }

        .action-buttons .delete-btn {
          background-color: #cc0000;
        }

        .action-buttons .delete-btn:hover {
          background-color: #990000;
        }

        .story-content {
          margin-top: 20px;
          padding: 20px;
          background-color: #f4f4f4;
          border-radius: 5px;
        }

        .story-content button {
          background-color: #4b0082;
          color: white;
          padding: 10px;
          border: none;
          cursor: pointer;
          border-radius: 5px;
        }

        .story-content button:hover {
          background-color: #3e0062;
        }

        .back-button {
          margin-top: 30px;
          background-color: #4b0082;
          color: white;
          padding: 10px 20px;
          border: none;
          cursor: pointer;
          border-radius: 5px;
        }

        .back-button:hover {
          background-color: #3e0062;
        }

        .audio-player {
          margin-top: 20px;
        }

        .audio-player audio {
          width: 100%;
        }
      `}</style>
    </Layout>
  );
}
