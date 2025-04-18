import Layout from '../../components/Layout';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { collection, getDocs } from 'firebase/firestore';
import { firestoreDB } from '../../firebase/firebaseConfig';

export default function MyStories() {
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestoreDB, 'stories'));
        const storiesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title,
          content: doc.data().content,
          theme: doc.data().theme,
          age: doc.data().age,
          genre: doc.data().genre,
          character: doc.data().character,
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

  return (
    <Layout>
      <div className="container">
        <h1>My Stories</h1>
        <ul>
          {stories.map((story) => (
            <li key={story.id}>
              <span
                onClick={() => handleSelectStory(story)}
                style={{ cursor: 'pointer', color: '#4B0082', textDecoration: 'underline' }}
              >
                {story.title}
              </span> - 
              <Link href={`/parent/create-story?id=${story.id}`} legacyBehavior>
                <a>Edit</a>
              </Link>
            </li>
          ))}
        </ul>

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

        {/* Back Button */}
        <button onClick={handleBack} className="back-button">
          Back
        </button>
      </div>

      <style jsx>{`
        .container {
          padding: 20px;
        }
        ul {
          list-style: none;
          padding: 0;
        }
        li {
          margin: 10px 0;
        }
        a {
          margin-left: 10px;
          color: #4B0082;
          text-decoration: underline;
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
