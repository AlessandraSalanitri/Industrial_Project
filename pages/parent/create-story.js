import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { firestoreDB } from '../../firebase/firebaseConfig'; // Import Firebase storage
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Firebase storage functions
import '../../styles/create_story.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function CreateStory() {
  const [story, setStory] = useState('');
  const [age, setAge] = useState('');
  const [genre, setGenre] = useState('');
  const [setting, setSetting] = useState('');
  const [moral, setMoral] = useState('');
  const [tone, setTone] = useState('');
  const [length, setLength] = useState('');
  const [character, setCharacter] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [storyName, setStoryName] = useState('');
  const [audioUrl, setAudioUrl] = useState(''); // To store the URL of the saved audio

  const router = useRouter();

  const [user, setUser] = useState(null);
  // This ensures the user variable is properly set once a user logs in.
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  
    return () => unsubscribe();
  }, []);

  // Stop speech when navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      window.speechSynthesis.cancel(); // Stop any ongoing speech
    };

    // Add event listener for the route change
    router.events.on('routeChangeStart', handleBeforeUnload);

    // Cleanup event listener when the component is unmounted
    return () => {
      router.events.off('routeChangeStart', handleBeforeUnload);
    };
  }, [router.events]);

  const handleGenerateAI = async () => {
    if (!character.trim()) {
      alert("Please enter the main character or theme!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ age, genre, setting, moral, tone, length, character }),
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

    if (!story.trim()) 
      return alert("No story generated!");
  
    if (!user) 
      return alert("You must be logged in to generate audio.");
  
    try {
      const userDocRef = doc(firestoreDB, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);
      const userData = userSnap.data();
      const voiceId = userData?.selectedVoice?.id;
  
      if (!voiceId) return alert("Go to Settings and select a voice first.");

      const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;

      if (!apiKey) {
        throw new Error("API key is not set in environment variables.");
      }
  
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text: story,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });
  
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      setAudioUrl(audioUrl);
  
      alert("Audio generated!");
    } catch (err) {
      console.error("Audio error:", err);
      alert("Something went wrong with audio generation.");
    }
  };

  const handleSaveStory = async () => {
    if (!story.trim()) {
      alert("There is no story to save!");
      return;
    }

    setShowModal(true);
  };

  const confirmSave = async () => {
    if (!user) {
      alert("You need to be logged in to save stories.");
      return;
    }
  
    if (!storyName.trim()) {
      alert("Please enter a name for your story.");
      return;
    }
  
    const storyId = uuidv4();

    try {
      await addDoc(collection(firestoreDB, "stories"), {
        id: storyId,
        title: storyName,
        content: story,
        age,
        genre,
        setting,
        moral,
        tone,
        length,
        character,
        audioUrl,
        createdAt: new Date(),
        userId: user.uid, // Binds story to current user
      });
  
      alert("Story saved successfully!");
      setStory('');
      setStoryName('');
      setAge('');
      setGenre('');
      setSetting('');
      setMoral('');
      setTone('');
      setLength('');
      setCharacter('');
      setAudioUrl('');
      setShowModal(false);
    } catch (error) {
      console.error("Error saving story:", error);
      alert(`Failed to save the story. Error: ${error.message}`);
    }
  };

  const handleBack = () => router.push('/');

  return (
    <Layout>
      <div className="container">
        <h1>Create Story</h1>

        {/* Story Inputs */}
        <select value={age} onChange={(e) => setAge(e.target.value)}>
          <option value="">Age</option>
          <option value="Under 3">Under 3</option>
          <option value="3-5">3-5</option>
          <option value="6-8">6-8</option>
          <option value="9-11">9-11</option>
          <option value="12-14">12-14</option>
        </select>

        <select value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option value="">Genre</option>
          
          <option value="Fantasy">Fantasy</option>
          <option value="Adventure">Adventure</option>
          <option value="Science Fiction">Science Fiction</option>
          <option value="Mystery">Mystery</option>
          <option value="Humor">Humor</option>
          <option value="Historical Fiction">Historical Fiction</option>
          <option value="Animal Stories">Animal Stories</option>
        </select>

        <select value={setting} onChange={(e) => setSetting(e.target.value)}>
          <option value="">Setting</option>
          <option value="Fantasy">Fantasy</option>
          <option value="Adventure">Adventure</option>
          <option value="Science Fiction">Science Fiction</option>
          <option value="Mystery">Mystery</option>
          <option value="Historical">Historical</option>
          <option value="Modern-Day">Modern-Day</option>
          <option value="Urban">Urban</option>
          <option value="Urban Fantasy">Urban Fantasy</option>
          <option value="Animal-Based">Animal-Based</option>
          <option value="Magical Realism">Magical Realism</option>
          <option value="Survival">Survival</option>
        </select>

        <select value={moral} onChange={(e) => setMoral(e.target.value)}>
          <option value="">Moral</option>
          <option value="Friendship and Teamwork">Friendship & Teamwork</option>
          <option value="Courage and Bravery">Courage & Bravery</option>
          <option value="Kindness and Empathy">Kindness & Empathy</option>
          <option value="Honesty and Integrity">Honesty & Integrity</option>
          <option value="Perseverance and Hard Work">Perseverance & Hard Work</option>
          <option value="Responsibility and Accountability">Responsibility & Accountability</option>
          <option value="Self-Respect and Confidence">Self-Respect & Confidence</option>
          <option value="Fairness and Justice">Fairness & Justice</option>
          <option value="Patience and Temperance">Patience & Temperance</option>
          <option value="Gratitude and Contentment">Gratitude & Contentment</option>
          <option value="Environmental Awareness">Environmental Awareness</option>
          <option value="Creativity and Imagination">Creativity & Imagination</option>
        </select>

        <select value={tone} onChange={(e) => setTone(e.target.value)}>
          <option value="">Tone</option>
          <option value="Lighthearted and Fun">Lighthearted & Fun</option>
          <option value="Serious and Reflective">Serious & Reflective</option>
          <option value="Adventurous and Exciting">Adventurous & Exciting</option>
          <option value="Mysterious and Suspenseful">Mysterious & Suspenseful</option>
          <option value="Optimistic and Hopeful">Optimistic & Hopeful</option>
          <option value="Funny and Humorous">Funny & Humorous</option>
          <option value="Romantic and Heartfelt">Romantic & Heartfelt</option>
          <option value="Educational and Informative">Educational & Informative</option>
          <option value="Fantasy and Magical">Fantasy & Magical</option>
          <option value="Heroic and Noble">Heroic & Noble</option>
        </select>

        <select value={length} onChange={(e) => setLength(e.target.value)}>
          <option value="">Reading Length</option>
          <option value="Short (2 minutes)">Short (2 minutes)</option>
          <option value="Medium (5 minutes)">Medium (5 minutes)</option>
          <option value="Long (7 minutes)">Long (7 minutes)</option>
        </select>

        <label htmlFor="character">Main Character</label>
        <input
          id="character"
          type="text"
          placeholder="e.g., Luna the clumsy dragon, Penny the Penguin..."
          value={character}
          onChange={(e) => setCharacter(e.target.value)}
        />

        <div className="actions">
          <button onClick={handleGenerateAI} className="btn" disabled={loading}>
            {loading ? 'Generating...' : 'Generate AI Content'}
          </button>
          <button onClick={handleConvertToAudio} className="btn">Convert to Audio</button>
          <button onClick={handleSaveStory} className="btn">Save Story</button>
          <button onClick={handleBack} className="btn">Back</button>
        </div>

        {story && (
          <div className="generated-story">
            <label htmlFor="story">Generated Story</label>
            <textarea
              id="story"
              value={story}
              readOnly
              placeholder="Your story will appear here..."
            ></textarea>
          </div>
        )}

        {showModal && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <h2>Name Your Story</h2>
              <input
                type="text"
                placeholder="Whiskers in Wonderwood..."
                value={storyName}
                onChange={(e) => setStoryName(e.target.value)}
              />
              <div className="modal-actions">
                <button className="save-btn" onClick={confirmSave}>Save</button>
                <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .container {
            padding: 20px;
          }
          select, input {
            width: 100%;
            padding: 10px;
            margin-bottom: 10px;
          }
          .actions {
            margin-top: 20px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
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
          .generated-story {
            margin-top: 20px;
          }
          .generated-story textarea {
            width: 100%;
            height: 300px;
            padding: 10px;
            resize: vertical;
            font-size: 1rem;
            line-height: 1.5;
          }
        `}</style>
      </div>
    </Layout>
  );
}
