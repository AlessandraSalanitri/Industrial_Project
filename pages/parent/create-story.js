import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { firestoreDB } from '../../firebase/firebaseConfig'; 
import { collection, addDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import '../../styles/create_story.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { MoonStars } from 'phosphor-react';

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
  const [audioUrl, setAudioUrl] = useState('');

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
      window.speechSynthesis.cancel();
    };
    router.events.on('routeChangeStart', handleBeforeUnload);
    return () => {
      router.events.off('routeChangeStart', handleBeforeUnload);
    };
  }, [router.events]);


  // GENERATE STORY AI
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
      const generatedStory = data.response || "Oops! Something went wrong.";
      setStory(generatedStory);
  
      // 👇 Grab the first line of the story (remove quotes)
      const titleLine = generatedStory.split('\n')[0].replace(/^"|"$/g, '');
      setStoryName(titleLine); // Set as default editable story title
  
    } catch (error) {
      console.error("Error generating story:", error);
      setStory("Error: Could not generate story.");
    }
    setLoading(false);
  };
  
  // CONVERT TO AUDIO
  const handleConvertToAudio = () => {
    if (!story.trim()) return alert("Please generate a story first!");
  
    const utterance = new SpeechSynthesisUtterance(story);
    utterance.lang = "en-GB";
    utterance.rate = 1;
    utterance.pitch = 1;
  
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
  
    // Speak it!
    window.speechSynthesis.speak(utterance);
  
    alert("Reading the story out loud now!");
  };

  const handleSaveStory = () => {
    if (!story.trim()) return alert("Please generate a story first!");
    setShowModal(true);
  };

  const confirmSave = async () => {
    if (!user) return alert("You need to be logged in to save stories.");
    if (!storyName.trim()) return alert("Please enter a title for your story.");

    const storyId = uuidv4();
    try {
      await addDoc(collection(firestoreDB, "stories"), {
        id: storyId,
        title: storyName,
        content: story,
        age, genre, setting, moral, tone, length, character,
        createdAt: new Date(),
        userId: user.uid,
        audioUrl,
      });
      alert("Story saved successfully!");
      setStory(''); setStoryName(''); setAge(''); setGenre(''); setSetting('');
      setMoral(''); setTone(''); setLength(''); setCharacter('');
      setAudioUrl(''); setShowModal(false);

      router.push('/parent/my-stories');
    } catch (error) {
      console.error("Error saving story:", error);
      alert(`Failed to save the story. Error: ${error.message}`);
    }
  };

  const handleBack = () => router.push('/parent/my-stories');


  return (
    <Layout>
      <div className="container">
        <h1>Create Story</h1>
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
          <option value="Animal Stories">Animal Stories</option></select>

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
          <option value="Survival">Survival</option></select>

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
          <option value="Long (7 minutes)">Long (7 minutes)</option></select>

        <label htmlFor="character">Main Character</label>
        <input id="character" type="text" placeholder="e.g., Luna the clumsy dragon..." value={character} onChange={(e) => 
          setCharacter(e.target.value)} />

        <div className="actions">
          {!story && (
            <button onClick={handleGenerateAI} className="btn" disabled={loading}>
              {loading ? 'Generating...' : 'Generate AI Content'}
            </button>
          )}
          {story && (
            <>
              <button onClick={handleConvertToAudio} className="button button-primary">Convert to Audio</button>
              <button onClick={handleSaveStory} className="button button-primary">Save Story</button>
              <button onClick={handleBack} className="button button-primary">Back</button>
            </>
          )}
        </div>

        {story && (
          <div className="generated-story">
            <label htmlFor="story">Generated Story</label>
            {storyName && (
              <div className="story-title">
                <MoonStars
                  size={28}
                  weight="fill"
                  style={{ marginRight: '6px', color: '#4B0082', verticalAlign: 'middle' }}
                />
                <strong>{storyName}</strong>
              </div>
            )}

            <textarea
              id="story"
              value={story.split('\n').slice(1).join('\n')}
              readOnly
              placeholder="Your story will appear here..."
            />
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
                <button className="button button-primary" onClick={confirmSave}>Save</button>
                <button className="button button-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}