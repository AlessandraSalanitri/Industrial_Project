// pages/parent/write-story.js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { firestoreDB } from '../../firebase/firebaseConfig'; 
import { collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid'; 
import '../../styles/create_story.css';  // reusing style
import '../../styles/alertmodal.css';


export default function WriteStory() {
  const [storyText, setStoryText] = useState('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false); // did they use "next paragraph"?
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState({ title: null, genre: null });
  const [isReading, setIsReading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showAudioErrorModal, setShowAudioErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const router = useRouter();

  const handleBack = () => {
    router.push('/parent/create-story');
  };


// ✨ Random image picker based on genre
const pickRandomImageForGenre = (genre) => {
  const genrePath = `/assets/story-images/${genre}/`;

  const genreImageCount = {
    "Adventure": 34,
    "Animal Stories": 39,
    "Fantasy": 35,
    "Historical Fiction": 28,
    "Humor": 20,
    "Mystery": 40,
    "Science Fiction": 32,
  };

  const maxImages = genreImageCount[genre] || 5;
  const randomNumber = Math.floor(Math.random() * maxImages) + 1;
  
  const fileName = `${genre.toLowerCase().replace(/\s/g, "_")}${randomNumber}.jpg`;

  return `${genrePath}${fileName}`;
};




//   GENERATE NEXT IDEEA FOR THE STORY
  const handleGenerateNext = async () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
      setErrorMessage("✨ A magical story needs a title to begin!");
    } else if (!genre.trim()) {
      newErrors.genre = 'Genre is required';
      setErrorMessage("📚 Pick a genre so we know what kind of adventure to tell!");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setErrorMessage('');

    setLoading(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "continue",         // 👈 tell the API we're continuing a story
          title: title.trim(),
          genre: genre.trim(),
          storyText: storyText.trim()
        }),
      });
  
      const data = await response.json();
      const nextPart = data.response || "Oops, the AI couldn't continue.";
      setStoryText(prev => prev + "\n\n" + nextPart);
      setGenerated(true);
  
    } catch (error) {
      console.error('Error generating next paragraph:', error);
      alert('Failed to continue story.');
    }
    setLoading(false);
  };
  

// SAVING STORY LOGIC
    const handleSave = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        alert("You must be logged in to save your story.");
        return;
    }

    if (!title.trim() || !storyText.trim()) {
        setShowErrorModal(true);
        return;
      }
      

      const storyId = uuidv4(); // generate random story ID
      const randomImageUrl = pickRandomImageForGenre(genre); // pick random image
      


    try {
        await addDoc(collection(firestoreDB, "stories"), {
        id: storyId,
        title: title.trim(),
        content: storyText.trim(),
        genre: genre.trim() || "Unknown",
        audioUrl: "", // save empty for now
        createdAt: new Date(),
        userId: user.uid,
        source: "manual",
        imageUrl: randomImageUrl,
        });

        setShowSuccessModal(true);

    } catch (error) {
        console.error("❌ Error saving story:", error);
        alert("Failed to save your story. Please try again.");
    }
    };

  
  
// CONVERT TO AUDIO
    const handleConvert = () => {
      if (!storyText.trim()) {
        setShowAudioErrorModal(true); // ✅ show modal
        return;
      }

      const cleanedStory = storyText.replace(/\*\*/g, '').trim();

      if (!isReading) {
        const utterance = new SpeechSynthesisUtterance(cleanedStory);
        utterance.lang = "en-GB";
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.onend = () => setIsReading(false);

        window.speechSynthesis.speak(utterance);
        setIsReading(true);
      } else {
        window.speechSynthesis.cancel();
        setIsReading(false);
      }
    };

  

    //COMPLETING FIELD 
  return (
    <Layout>
      <div className="container">
        <h1>Write Your Own Story</h1>

        {errorMessage && (
              <p className="friendly-error-message">{errorMessage}</p>
            )}
            
        <input
          type="text"
          placeholder="Enter your story title..."
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) {
              setErrors((prev) => ({ ...prev, title: null }));
            }
          }}
          className={errors.title ? "input-error" : ""}
        />



        <select
          value={genre}
          onChange={(e) => {
            setGenre(e.target.value);
            if (errors.genre) {
              setErrors((prev) => ({ ...prev, genre: null }));
            }
          }}
          className={errors.genre ? "input-error" : ""}
        >
        <option value="">Select Genre</option>
        <option value="Fantasy">Fantasy</option>
        <option value="Adventure">Adventure</option>
        <option value="Mystery">Mystery</option>
        <option value="Science Fiction">Science Fiction</option>
        <option value="Historical Fiction">Historical Fiction</option>
        <option value="Animal Stories">Animal Stories</option>
        </select>

        <div className="generated-story">
        <textarea
            value={storyText}
            onChange={(e) => setStoryText(e.target.value)}
            placeholder="Start writing your magical bedtime story here..."
        />
        </div>




        <div className="actions">
            <button
                onClick={handleGenerateNext}
                className="button button-primary"
                disabled={loading}
            >
                {loading ? 'Generating next paragraph...' : 'Generate Next Paragraph'}
            </button>

            <button onClick={handleSave} className="button button-primary">
                Save Story
            </button>
            <button onClick={handleConvert} className="button button-primary">
            {isReading ? "⏹ Stop Reading" : "▶ Read Aloud"}
            </button>


            <button onClick={handleBack} className="button button-secondary">
                ↩ Back
            </button>
            </div>




            {/* SAVE STORY MESSAGE */}
            {showSuccessModal && (
            <div className="modal-backdrop">
                <div className="modal-content">
                <h2 className="success-heading">🎉 Story Saved Successfully!</h2>
                <p>
                    Your story <strong>“{title || "Untitled"}”</strong> has been saved and is now in <strong>My Stories</strong>.
                </p>
                <div className="modal-actions">
                    <button
                    className="button button-primary"
                    onClick={() => {
                        setShowSuccessModal(false);
                        setStoryText('');
                        setTitle('');
                        setGenre('');
                        router.push('/parent/my-stories');
                    }}
                    >
                    OK
                    </button>
                </div>
                </div>
            </div>
            )}

            {/* POP UP MESSAGE IF THE REQ FIELDS ARE NOT COMPLETED */}
            {showErrorModal && (
            <div className="modal-backdrop">
                <div className="modal-content">
                <h2 className="error-heading">🚨 Incomplete Story</h2>
                <p>Please make sure your story has a <strong>title</strong> and some <strong>text</strong> before saving.</p>
                <div className="modal-actions">
                    <button className="button button-primary" onClick={() => setShowErrorModal(false)}>
                    OK
                    </button>
                </div>
                </div>
            </div>
            )}

            {/* ERROR MESSAGE AUDIO IF NO TEXT */}
            {showAudioErrorModal && (
              <div className="modal-backdrop">
                <div className="modal-content">
                  <h2 className="error-heading">🚨 Incomplete Story</h2>
                  <p>Please write or generate some story text before using <strong>Read Aloud</strong>.</p>
                  <div className="modal-actions">
                    <button
                      className="button button-primary"
                      onClick={() => setShowAudioErrorModal(false)}
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>
            )}

      </div>
    </Layout>
  );
}
