// components/StoryModal.js.js

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X } from "phosphor-react";
import "../styles/story_modal.css";

export default function StoryModal({ isOpen = true, story, onClose, onChangeImageClick }) {

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeParagraphIndex, setActiveParagraphIndex] = useState(null);
  const utteranceRef = useRef(null);
  const queueRef = useRef([]);

  const handlePlay = () => {
    if (!story?.content) return;

    const paragraphs = story.content.split("\n\n");
    queueRef.current = [...paragraphs];
    setActiveParagraphIndex(0);
    speakParagraph(0);
  };

  const speakParagraph = (index) => {
    const paragraphs = queueRef.current;
    if (index >= paragraphs.length) {
      handleStop();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(paragraphs[index]);
    utterance.lang = "en-GB";
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onend = () => {
      setActiveParagraphIndex((prevIndex) => {
        const newIndex = prevIndex + 1;
        const progressPercent = ((newIndex + 1) / paragraphs.length) * 100;
        setProgress(progressPercent);
        speakParagraph(newIndex);
        return newIndex;
      });
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
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
    window.speechSynthesis.cancel();
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

        <h2 className="story-title-modal">{story.title.replace(/\\/g, '')}</h2>

        <div className="modal-content-area">
          <div className="modal-image">
            {/* UPDATED */}
          <Image
            src={story.customImage || story.thumbnail || "/assets/story/sample_story.png"}
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
