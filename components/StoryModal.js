import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, MoonStars } from "phosphor-react";
import "../styles/story_modal.css";
import { speakWithUserVoice, stopSpeech } from '../utils/tts';


export default function StoryModal({ isOpen = true, story, onClose, onChangeImageClick }) {

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeParagraphIndex, setActiveParagraphIndex] = useState(null);
  const utteranceRef = useRef(null);
  const queueRef = useRef([]);

  const handlePlay = async () => {
    if (!story?.content) return;
  
    const paragraphs = story.content.split("\n\n");
    queueRef.current = [...paragraphs];
    setActiveParagraphIndex(0);
  
    await speakParagraphWithVoice(0);
  };
  
  const speakParagraphWithVoice = async (index) => {
    const paragraphs = queueRef.current;
    if (index >= paragraphs.length) {
      handleStop();
      return;
    }
  
    const currentParagraph = paragraphs[index];
    setIsPlaying(true);
  
    await speakWithUserVoice(currentParagraph, () => {
      const newIndex = index + 1;
      setActiveParagraphIndex(newIndex);
      setProgress(((newIndex + 1) / paragraphs.length) * 100);
      speakParagraphWithVoice(newIndex);
    });
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPlaying(false);
  };

  const handleResume = () => {
    window.speechSynthesis.resume();
    setIsPlaying(true);
  };

  const handleStop = () => {
    stopSpeech();
    setIsPlaying(false);
    setProgress(0);
    setActiveParagraphIndex(null);
  };

  useEffect(() => {
    return () => {
      handleStop();
    };
  }, []);

  if (!isOpen || !story) return null;

  return (
    <div className="story-modal-wrapper">
      <div className="story-modal">
        <button className="modal-close" onClick={() => { handleStop(); onClose(); }}>
          <X size={24} />
        </button>

        <h2 className="story-title-modal">
          <MoonStars size={28} weight="fill" style={{ marginRight: '8px', color: '#4B0082', verticalAlign: 'middle' }} />
          {story.title.replace(/\\/g, '')}
        </h2>

        <div className="modal-content-area">
          <div className="modal-image">
            <Image
              src={story.imageUrl || story.customImage || story.thumbnail || "/assets/story/sample_story.png"}
              alt={story.title}
              width={200}
              height={200}
              className="thumbnail"
              onClick={onChangeImageClick}
              style={{
                cursor: "pointer",
                borderRadius: "10px",
                transition: "transform 0.2s",
                boxShadow: "0 0 8px rgba(0,0,0,0.2)"
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
            />
          </div>

          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          <div className="controls">
            {!isPlaying && <button onClick={handlePlay} className="button button-primary">▶ Play</button>}
            {isPlaying && <button onClick={handlePause} className="button button-secondary">⏸ Pause</button>}
            <button onClick={handleResume} className="button button-secondary">↻ Resume</button>
            <button onClick={handleStop} className="button button-secondary">⏹ Stop</button>
          </div>

          <div className="modal-body">
            <div className="story-text">
              {story.content.split("\n\n").map((p, i) => (
                <p
                  key={i}
                  className={`paragraph ${i === activeParagraphIndex ? 'active-paragraph typewriter' : ''}`}
                >
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}