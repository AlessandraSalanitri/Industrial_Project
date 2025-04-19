import Layout from '../../components/Layout';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { firestoreDB } from '../../firebase/firebaseConfig';

export default function MyStories() {
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
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

  return (
    <Layout>
      <div className="container">
        <h1>My Stories</h1>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Theme</th>
              <th>Age</th>
              <th>Genre</th>
              <th>Main Character</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stories.map((story, index) => (
              <tr key={story.id}>
                <td>{index + 1}</td>
                <td>{story.title}</td>
                <td>{story.theme}</td>
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
            ))}
          </tbody>
        </table>

        {selectedStory && (
          <div className="story-content">
            <button onClick={handleCloseStory} style={{ marginBottom: '20px' }}>
              Close Story
            </button>
            <h2>{selectedStory.title}</h2>
            <p><strong>Theme:</strong> {selectedStory.theme}</p>
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
          background-color: #4B0082;
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
          background-color: #4B0082;
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
          background-color: #4B0082;
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
          background-color: #4B0082;
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
