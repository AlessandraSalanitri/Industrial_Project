// pages/parent/create-story.js
import { useState } from 'react';
import Layout from '../../components/Layout';

export default function CreateStory() {
  const [story, setStory] = useState('');

  const handleChange = (e) => {
    setStory(e.target.value);
  };

  const handleGenerateAI = async () => {
    // Example: Call your AI API to generate content
    setStory(story + ' (AI generated content)');
  };

  const handleConvertToAudio = async () => {
    // Example: Call your TTS API to convert story text to audio
    alert('Converting story to audio...');
  };

  const handleSaveStory = () => {
    // Example: Save the story to Firebase Firestore
    alert('Story saved!');
  };

  return (
    <Layout>
      <div className="container">
        <h1>Create Story</h1>
        <textarea
          placeholder="Type your story here..."
          value={story}
          onChange={handleChange}
          rows="10"
          style={{ width: '100%', padding: '10px', fontSize: '16px' }}
        ></textarea>
        <div className="actions">
          <button onClick={handleGenerateAI} className="btn">Generate AI Content</button>
          <button onClick={handleConvertToAudio} className="btn">Convert to Audio</button>
          <button onClick={handleSaveStory} className="btn">Save Story</button>
        </div>
      </div>
      <style jsx>{`
        .container {
          padding: 20px;
        }
        .actions {
          margin-top: 20px;
          display: flex;
          gap: 10px;
        }
        .btn {
          background-color: #4B0082;
          color: #fff;
          border: none;
          padding: 10px 15px;
          cursor: pointer;
          border-radius: 5px;
        }
      `}</style>
    </Layout>
  );
}
