// pages/parent/create-story.js
import { useState } from 'react';
import Layout from '../../components/Layout';

export default function CreateStory() {
  const [story, setStory] = useState('');

  const handleChange = (e) => {
    setStory(e.target.value);
  };



  // const handleGenerateAI = async () => {
  //   // Example: Call your AI API to generate content
  //   setStory(story + ' (AI generated content)');
  // };

//The user types a theme, clicks Generate AI Content, and we call your API to generate a full magical story.
  const handleGenerateAI = async () => {
    if (!theme.trim()) {
      alert("Please enter a theme!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `Please create a magical bedtime story for a child aged ${age}. The genre is ${genre}. The main character or theme of the story is : ${character}. The story should have a beginning, middle, and happy ending. Make it simple, magical, friendly, imaginative, and easy to read aloud to children. Keep it engaging and age-appropriate.`,
          
        }),
      });

      const data = await response.json();
      setStory(data.response || "Oops! Something went wrong.");
    } catch (error) {
      console.error("Error generating story:", error);
      setStory("Error: Could not generate story.");
    }
    setLoading(false);
  };

  

// TEXT TO AUDIO
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
