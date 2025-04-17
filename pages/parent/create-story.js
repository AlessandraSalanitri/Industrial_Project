import { useState } from 'react';
import Layout from '../../components/Layout';

export default function CreateStory() {
  const [story, setStory] = useState('');
  const [theme, setTheme] = useState('');
  const [age, setAge] = useState('');
  const [genre, setGenre] = useState('');
  const [character, setCharacter] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setStory(e.target.value);
  };

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
          prompt: `Write a magical bedtime story for a child aged ${age || '5'}. 
          Genre: ${genre || 'fantasy'}. 
          Main character or theme: ${character || theme}.
          The story should be simple, imaginative, and end happily. Make it fun to read aloud, like a fairy tale. 
          Begin with: "Once upon a time..."`,
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

  const handleConvertToAudio = async () => {
    alert('Converting story to audio...');
  };

  const handleSaveStory = () => {
    alert('Story saved!');
  };

  return (
    <Layout>
      <div className="container">
        <h1>Create Story</h1>

        <input
          type="text"
          placeholder="Theme"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          style={{ marginBottom: '10px', width: '100%', padding: '10px' }}
        />
        <input
          type="text"
          placeholder="Child's Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          style={{ marginBottom: '10px', width: '100%', padding: '10px' }}
        />
        <input
          type="text"
          placeholder="Genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          style={{ marginBottom: '10px', width: '100%', padding: '10px' }}
        />
        <input
          type="text"
          placeholder="Main Character or Theme"
          value={character}
          onChange={(e) => setCharacter(e.target.value)}
          style={{ marginBottom: '10px', width: '100%', padding: '10px' }}
        />

        <textarea
          placeholder="Type your story here..."
          value={story}
          onChange={handleChange}
          rows="10"
          style={{ width: '100%', padding: '10px', fontSize: '16px' }}
        ></textarea>

        <div className="actions">
          <button onClick={handleGenerateAI} className="btn" disabled={loading}>
            {loading ? 'Generating...' : 'Generate AI Content'}
          </button>
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
        .btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </Layout>
  );
}
