import { useEffect, useState } from "react";
import { firestoreDB } from "../firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import Image from "next/image";
import { useUser } from '../context/UserContext';
import "../styles/story_list.css";

export default function StoryList({ onPlay }) {
  const { user } = useUser();
  const [stories, setStories] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [filteredStories, setFilteredStories] = useState([]);

  useEffect(() => {
    if (user) {
      const getEffectiveChildEmail = () => {
        const rawEmail = user?.email || firebaseAuth.currentUser?.email;
        return rawEmail?.includes('-child@simulated.com') ? rawEmail : `${rawEmail}-child@simulated.com`;
      };
      fetchUserStories(getEffectiveChildEmail());
    }
  }, [user]);

  const fetchUserStories = async (childEmail) => {
    try {
      const linkedQuery = query(
        collection(firestoreDB, 'linkedAccounts'),
        where('childEmail', '==', childEmail)
      );
      const snapshot = await getDocs(linkedQuery);
      const parentIds = snapshot.docs.map(doc => doc.data().parentId);

      if (parentIds.length === 0) {
        console.warn("Your account should be linked to a parent account to view stories.");
        return;
      }

      const storiesQuery = query(
        collection(firestoreDB, 'stories'),
        where('userId', 'in', parentIds)
      );

      const storiesSnap = await getDocs(storiesQuery);
      const storiesData = storiesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStories(storiesData);
    } catch (error) {
      console.error("Error fetching stories:", error);
    }
  };

  useEffect(() => {
    applyFilters(searchText, selectedGenre, stories);
  }, [searchText, selectedGenre, stories]);

  const applyFilters = (search, genre, allStories) => {
    let filtered = [...allStories];

    if (genre) {
      filtered = filtered.filter(story => story.genre === genre);
    }

    if (search.trim()) {
      filtered = filtered.filter(story =>
        story.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredStories(filtered);
  };

  return (
    <>
      <h1>Story List</h1>

      <div className="dashboard-controls">
        <input
          type="text"
          placeholder="Search by title"
          className="search-input"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <select
          className="filter-select"
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
        >
          <option value="">All Genres</option>
          <option value="Fantasy">Fantasy</option>
          <option value="Adventure">Adventure</option>
          <option value="Science Fiction">Science Fiction</option>
          <option value="Mystery">Mystery</option>
          <option value="Humor">Humor</option>
          <option value="Historical Fiction">Historical Fiction</option>
          <option value="Animal Stories">Animal Stories</option>
        </select>

        <button onClick={() => { setSearchText(''); setSelectedGenre(''); }}>
          Reset Filters
        </button>
      </div>

      <div className="story-grid">
        {filteredStories.map((story) => (
          <div className="story-card" key={story.id}>
            <div className="story-title">{story.title}</div>
            <div className="story-thumbnail">
              <Image
                src={story.thumbnail || "/assets/sample_story.png"}
                alt={story.title}
                width={900}
                height={400}
              />
              <button className="play-button" onClick={() => onPlay?.(story)}>
                ▶
              </button>
            </div>
            <button
              className="button button-primary"
              onClick={() => onPlay?.(story)}
            >
              Play
            </button>
            {story.audioUrl && (
              <a href={story.audioUrl} download className="button button-secondary">
                Download Audio
              </a>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
