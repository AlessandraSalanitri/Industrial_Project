import Image from "next/image";
import "../styles/story_list.css";

// filtering and play navigation needs to be wired.
// hardcoded stories before genereting them with AI
const defaultStories = [
  { id: 1, title: "The Magical Forest", thumbnail: "/assets/sample_story.png" },
  { id: 2, title: "Journey to the Stars", thumbnail: "/assets/sample_story.png" },
  { id: 3, title: "The Sunny Day", thumbnail: "/assets/sample_story.png" },
  { id: 4, title: "The Brave Lion", thumbnail: "/assets/sample_story.png" },
  { id: 5, title: "The Jungle Surprise", thumbnail: "/assets/sample_story.png" },
  { id: 6, title: "Pirate Adventure", thumbnail: "/assets/sample_story.png" },
  { id: 7, title: "The Golden Egg", thumbnail: "/assets/sample_story.png" },
];

export default function StoryList({ stories = defaultStories, onPlay }) {
  return (
    <>
      <h1>Story List</h1>

      <div className="dashboard-controls">
        <input type="text" placeholder="search" className="search-input" />
        <select className="filter-select">
          <option disabled selected>
            Filter by genre
          </option>
          <option value="adventure">Adventure</option>
          <option value="fairy-tale">Fairy Tale</option>
          <option value="educational">Educational</option>
          <option value="fantasy">Fantasy</option>
          <option value="animal-stories">Animal Stories</option>
          <option value="moral-stories">Moral Stories</option>
        </select>
        
      </div>

      <div className="story-grid">
        {stories.map((story) => (
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
              className="button button-secondary"
              onClick={() => onPlay?.(story)}
            >
              Play
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
