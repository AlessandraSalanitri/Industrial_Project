// /components/StoryList.js

import { useEffect, useState } from "react";
import { firestoreDB } from "../firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import Image from "next/image";
import { useUser } from '../context/UserContext';
import "../styles/story_list.css";
import StoryModal from "../components/StoryModal";
import { MoonStars } from 'phosphor-react';


export default function StoryList() {
  const { user } = useUser();
  const [stories, setStories] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [filteredStories, setFilteredStories] = useState([]);
  const [modalStory, setModalStory] = useState(null);
 
 
  useEffect(() => {
    if (user?.email) {
      fetchUserStories(user.email);
    }
  }, [user]);
  

  const fetchUserStories = async (childEmail) => {
    try {
      const linkedQuery = query(
        collection(firestoreDB, 'linkedAccounts'),
        where('childEmail', '==', childEmail)
      );
      console.log("Checking links for:", childEmail);

      const snapshot = await getDocs(linkedQuery);
      snapshot.forEach(doc => {
        console.log("Linked child email in DB:", doc.data().childEmail);
      });

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
    let filtered = [...stories];
    if (selectedGenre) filtered = filtered.filter((s) => s.genre === selectedGenre);
    if (searchText.trim())
      filtered = filtered.filter((s) =>
        s.title.toLowerCase().includes(searchText.toLowerCase())
      );
    setFilteredStories(filtered);
  }, [searchText, selectedGenre, stories]);


  return (
    <div className="story-list-container">
      <h1>Story List</h1>

      <div className="dashboard-controls">
        <input
          type="text"
          placeholder="Search by title"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="search-input"
        />
        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="filter-select"
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
        <button onClick={() => { setSearchText(""); setSelectedGenre(""); }}>
          Reset Filters
        </button>
      </div>

      <div className="story-grid">
        {filteredStories.map((story) => (
          <div className="story-card" key={story.id}>
            
             <div className="dashboard-story-title">
                <MoonStars
                  size={28}
                  weight="fill"
                  style={{
                    marginRight: '6px', 
                    color: '#4B0082', 
                    verticalAlign: 'middle' }}
                  />
                  <strong>{story.title}</strong>
                  </div>

            <div className="story-thumbnail">
            <Image
              src={story.imageUrl || "/assets/story/sample_story.png"}
              alt={story.title}
              width={140}
              height={140}
              style={{ borderRadius: "50%" }}
            />
              <button className="play-button" onClick={() => setModalStory(story)}>
                ▶
              </button>
            </div>
            <button className="play-action" onClick={() => setModalStory(story)}>
              Play Story
            </button>
          </div>
        ))}

        {modalStory && (
          <StoryModal
            isOpen={true} // 
            story={modalStory}
            onClose={() => setModalStory(null)}
          />
        )}

      </div>
    </div>
  );
}
