import Layout from '../../components/Layout';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { firestoreDB } from '../../firebase/firebaseConfig';

export default function MyStories() {
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [filterLetter, setFilterLetter] = useState(null);
  const [genreFilter, setGenreFilter] = useState(null);
  const [ageFilter, setAgeFilter] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestoreDB, 'stories'));
        const storiesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStories(storiesData);
      } catch (error) {
        console.error('Error fetching stories:', error);
      }
    };

    fetchStories();
  }, []);

  const handleSelectStory = (story) => {
    setSelectedStory(story);
  };

  const handleCloseStory = () => {
    setSelectedStory(null);
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
        <p className="subtitle">Your saved stories. Filter, view, edit, or delete them below.</p>

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
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>
                  No stories found{filterLetter ? ` for letter "${filterLetter}"` : ''}.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {selectedStory && (
          <div className="story-content">
            <button onClick={handleCloseStory} style={{ marginBottom: '20px' }}>
              Close Story
            </button>
            <h2>{selectedStory.title}</h2>
            <p><strong>Age:</strong> {selectedStory.age}</p>
            <p><strong>Genre:</strong> {selectedStory.genre}</p>
            <p><strong>Main Character:</strong> {selectedStory.character}</p>
            <p><strong>Story Content:</strong></p>
            <p>{selectedStory.content}</p>
          </div>
        )}

        <button onClick={handleBack} className="back-button">
          Back
        </button>
      </div>

      <style jsx>{`
        .container {
          padding: 20px;
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

        th:nth-child(1), td:nth-child(1) {
          width: 50px;
          text-align: center;
        }

        .action-buttons {
          display: flex;
          flex-wrap: nowrap;
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
      `}</style>
    </Layout>
  );
}
