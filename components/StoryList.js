import { useEffect, useState, useRef } from "react";
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
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  const carouselRef = useRef(null);

  useEffect(() => {
    if (user?.email) fetchUserStories(user.email);
  }, [user, showFavoritesOnly]); // refetch when toggling showFavoritesOnly

  const fetchUserStories = async (childEmail) => {
    try {
      const linkedQuery = query(
        collection(firestoreDB, 'linkedAccounts'),
        where('childEmail', '==', childEmail)
      );
      const snapshot = await getDocs(linkedQuery);
      const parentIds = snapshot.docs.map(doc => doc.data().parentId);
      if (parentIds.length === 0) return;

      let storiesQuery = query(
        collection(firestoreDB, 'stories'),
        where('userId', 'in', parentIds)
      );

      if (showFavoritesOnly) {
        storiesQuery = query(
          collection(firestoreDB, 'stories'),
          where('userId', 'in', parentIds),
          where('favourite', '==', true)
        );
      }

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
    if (searchText.trim()) filtered = filtered.filter((s) =>
      s.title.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredStories(filtered);
  }, [searchText, selectedGenre, stories]);

  const scrollCarousel = (direction) => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const scrollAmount = container.offsetWidth * 0.7;
    container.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
  };

  const showLeftArrow = () => {
    if (!carouselRef.current) return false;
    return carouselRef.current.scrollLeft > 0;
  };

  const showRightArrow = () => {
    if (!carouselRef.current) return false;
    return carouselRef.current.scrollLeft + carouselRef.current.clientWidth < carouselRef.current.scrollWidth;
  };

  const handleScroll = () => {
    if (carouselRef.current) {
      setScrollPosition(carouselRef.current.scrollLeft);
    }
  };

  return (
    <div className="story-list-container">
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

        <button onClick={() => { setSearchText(""); setSelectedGenre(""); }}>Reset Filters</button>

        <button className="favorites-toggle" onClick={() => setShowFavoritesOnly(prev => !prev)}>
           {showFavoritesOnly ? "❤ Show All" : "❤️ Your Favourite Stories"}
        </button>
      </div>

      <div className="carousel-wrapper">
        <div
          className="story-carousel"
          id="storyCarousel"
          ref={carouselRef}
          onScroll={handleScroll}
        >
          {filteredStories.map((story) => (
            <div className="story-card" key={story.id}>
              <div className="dashboard-story-title">
                <MoonStars size={24} weight="fill" style={{ marginRight: '6px', color: '#4B0082' }} />
                <strong>{story.title}</strong>
              </div>

              <div className="story-thumbnail">
                <Image
                  src={story.imageUrl || "/assets/story/sample_story.png"}
                  alt={story.title}
                  width={120}
                  height={120}
                  style={{ borderRadius: "50%" }}
                />
                <button className="play-button" onClick={() => setModalStory(story)}>▶</button>
              </div>

              {/* Updated favourite icon logic */}
              <div className="favorite-icon">
                {story.favourite ? "❤️" : "❤"}
              </div>

              <button className="play-action" onClick={() => setModalStory(story)}>Play Story</button>
            </div>
          ))}
        </div>

        {modalStory && (
          <StoryModal
            isOpen={true}
            story={modalStory}
            onClose={() => setModalStory(null)}
          />
        )}
      </div>

      {showLeftArrow() && (
        <button className="arrow left" onClick={() => scrollCarousel('left')}>←</button>
      )}
      {showRightArrow() && (
        <button className="arrow right" onClick={() => scrollCarousel('right')}>→</button>
      )}
    </div>
  );
}
