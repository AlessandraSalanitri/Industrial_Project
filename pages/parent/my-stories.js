// Refactored `MyStories` page
import Layout from '../../components/Layout';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { firestoreDB } from '../../firebase/firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { MoonStars } from 'phosphor-react';
import '../../styles/mystories.css';

export default function MyStories() {
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [filters, setFilters] = useState({ letter: null, genre: null, age: null });
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), setUser);
    return () => unsubscribe();
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
    return startsWithLetter && matchesGenre && matchesAge;
  });


  const handleDeleteStory = async (id) => {
    await deleteDoc(doc(firestoreDB, 'stories', id));
    setStories(prev => prev.filter(story => story.id !== id));
  };

  function handleReadStory(content) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = 'en-GB';
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  }
  

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
            >{letter}</button>
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
          <button onClick={() => setFilters({ letter: null, genre: null, age: null })} className="reset-btn">Clear Filters</button>
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
              <th>Audio</th>
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
                    <button onClick={() => setSelectedStory(story)}>View</button>
                    <Link href={`/parent/edit-story?id=${story.id}`}><button>Edit</button></Link>
                    <button className="delete-btn" onClick={() => handleDeleteStory(story.id)}>Delete</button>
                  </div>
                </td>
                <td>
                  <button onClick={() => handleReadStory(story)}>Listen</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selectedStory && (
          <div className="story-content">
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button onClick={() => setSelectedStory(null)}>Close</button>
              <button onClick={() => handleReadStory(selectedStory.content)}>Read Story</button>
            </div>
            <div className="story-title">
              <MoonStars size={28} style={{ color: '#4B0082', marginRight: '8px' }} />
              <strong>{selectedStory.title.replace(/\*\*/g, '')}</strong>
            </div>
            <p><strong>Age:</strong> {selectedStory.age}</p>
            <p><strong>Genre:</strong> {selectedStory.genre}</p>
            <p><strong>Main Character:</strong> {selectedStory.character}</p>
            <div className="story-paragraphs">
              {selectedStory.content?.split('\n\n')?.map((para, i) => <p key={i}>{para}</p>)}
            </div>
          </div>
        )}

        <button className="back-button" onClick={() => router.push('/')}>Back</button>
      </div>
    </Layout>
  );
}

