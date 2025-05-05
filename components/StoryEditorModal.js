import { useState, useEffect } from 'react';
import { PencilLine  } from 'phosphor-react';
import { MoonStars   } from 'phosphor-react';
import '../styles/mystories.css';
import '../styles/StoryEditorModal.css';

export default function StoryEditorModal({ isOpen, mode = "view", story, onClose, onSave, onRead, onPause, onResume, onStop }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [editStory, setEditStory] = useState(null);

  useEffect(() => {
    if (mode === "edit" && story) {
      setEditStory({ ...story });
    }
  }, [story, mode]);

  if (!isOpen || !story) return null;

  const paragraphs = story.content?.split('\n\n') || [];
  const shouldSkipFirstParagraph = story.source === "ai" && paragraphs[0]?.includes(story.title);
  const paragraphsToDisplay = paragraphs.slice(shouldSkipFirstParagraph ? 1 : 0);

  const handleChange = (field, value) => {
    setEditStory(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (onSave && editStory) {
      onSave(editStory);
    }
  };


  const handlePlay = () => {
    onRead(story.content);
    setIsPlaying(true);
    setIsPaused(false);
  };
  
  const handlePause = () => {
    onPause();
    setIsPaused(true);
  };
  
  const handleResume = () => {
    onResume();
    setIsPaused(false);
  };
  
  const handleStop = () => {
    onStop();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleClose = () => {
    window.speechSynthesis.cancel(); 
    setIsPlaying(false);              
    setIsPaused(false);               
    onClose();                       
  };

  

  return (
    <div className="modal-overlay">
      <div className="modal-content">

      {mode === "view" && (

      <div className="story-content">

        <div className="view-button-group">
          {/* Left Side */}
          <div className="left-buttons">
          <button onClick={handleClose} className="button button-back same-size-button">
            ← <span className="btn-text">Back</span>
          </button>
          </div>

          {/* Right Side */}
          <div className="right-buttons">
          {!isPlaying && !isPaused && (
            <button onClick={handlePlay} className="button button-primary same-size-button">
            ▶  <span className="btn-text"> Play</span>
          </button>
          )}

          {isPlaying && !isPaused && (
            <button onClick={handlePause} className="button button-secondary same-size-button">
            ⏸ <span className="btn-text">Pause</span>
          </button>
          )}

          {isPaused && (
            <button onClick={handleResume} className="button button-primary same-size-button">
            ↻ <span className="btn-text">Resume</span>
          </button>
          )}

          <button onClick={handleStop}  className="button button-primary same-size-button">
            ⏹ <span className="btn-text">Stop</span>
          </button>
        </div>
        </div>


        <div className="story-title">
        <MoonStars size={28} weight="fill" className="story-icon" style={{ marginRight: '8px' }} />
        <strong>{story.title.replace(/\*\*/g, '')}</strong>
        </div>

        <p><strong>Age:</strong> {story.age}</p>
        <p><strong>Genre:</strong> {story.genre}</p>

        <div className="story-paragraphs">
          {paragraphsToDisplay.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

      </div>

    )}


      {mode === "edit" && editStory && (
        <div className="story-content">
          {/* Section Title */}
          <div className="story-title">
            <PencilLine size={28} weight="fill" className="story-icon" style={{ marginRight: '8px' }} />
            <strong>Refine Your Tale</strong>
          </div>

          {/* Title */}
          <label><strong>Edit Your Title</strong></label>
          <input
            type="text"
            value={editStory.title || ""}
            onChange={e => handleChange("title", e.target.value)}
            placeholder="Enter story title"
            className="input-field"
          />

          {/* Genre */}
          <label><strong>Select Genre</strong></label>
          <select
            value={editStory.genre || ""}
            onChange={e => handleChange("genre", e.target.value)}
            className="input-field"
          >
            <option value="">Select Genre</option>
            <option value="Adventure">Adventure</option>
            <option value="Fairy Tale">Fairy Tale</option>
            <option value="Mystery">Mystery</option>
            <option value="Fantasy">Fantasy</option>
          </select>

          {/* Content */}
          <textarea
            value={editStory.content || ""}
            onChange={e => handleChange("content", e.target.value)}
            placeholder="Write your story here..."
            rows={8}
            className="input-field"
          />

          {/* Save Button */}

          <div className="button-group">
            <button onClick={onClose} className="button button-secondary same-size-button">
            ↩ Back
            </button>
            <button onClick={handleSave} className="button button-primary same-size-button">
              Update Story
            </button>
          </div>

        </div>

      )}

      </div>

    </div>
  );
}
