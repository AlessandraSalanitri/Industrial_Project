import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X } from "phosphor-react";
import "../styles/story_modal.css";

export default function StoryModal({ isOpen, story, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const utteranceRef = useRef(null);
  const intervalRef = useRef(null);

  const handlePlay = () => {
    if (!story?.content) return;

    const utterance = new SpeechSynthesisUtterance(story.content);
    utterance.lang = 'en-GB';
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onend = () => {
      setIsPlaying(false);
      setProgress(100);
      clearInterval(intervalRef.current);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);

    intervalRef.current = setInterval(() => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + 1;
      });
    }, 500);
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPlaying(false);
    clearInterval(intervalRef.current);
  };

  const handleResume = () => {
    window.speechSynthesis.resume();
    setIsPlaying(true);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setProgress(0);
    clearInterval(intervalRef.current);
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
            <Image
              src={story.thumbnail || "/assets/story/sample_story.png"}
              alt={story.title}
              width={200}
              height={200}
              className="thumbnail"
            />
          </div>
          
          <div className="progress-container">
              <div className="progress-bar">
                <div className="progress" style={{ width: `${progress}%` }}></div>
              </div>
            </div>

            <div className="controls">
              {!isPlaying && <button onClick={handlePlay} className="button button-primary">▶ Play</button>}
              {isPlaying && <button onClick={handlePause} className="button button-primary">⏸ Pause</button>}
              <button onClick={handleResume} className="button button-secondary">↻ Resume</button>
              <button onClick={handleStop} className="button button-secondary">⏹ Stop</button>
            </div>

          <div className="modal-body">
            <div className="story-text">
              {story.content.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}