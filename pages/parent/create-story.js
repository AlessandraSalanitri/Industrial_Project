//pages/parent/create-story.js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { firestoreDB } from '../../firebase/firebaseConfig'; 
import { addDoc, collection, updateDoc, doc, getDoc } from 'firebase/firestore';
import '../../styles/create_story.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { MoonStars } from 'phosphor-react';
import StoryPageTour from '../../components/StoryPageTour';
import AlertModal from '../../components/AlertModal';
import { speakWithUserVoice, stopSpeech } from '../../utils/tts';



// ✨ Random image picker based on genre
const pickRandomImageForGenre = (genre) => {
  if (!genre) {
    return '/assets/story/sample_story.png';  // fallback if genre missing
  }

  const genrePath = `/assets/story-images/${genre}/`; // Use raw genre (with spaces & case)
  
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

  const fileName = `${genre.replace(/\s/g, "_").toLowerCase()}${randomNumber}.jpg`; // keep this logic for filename

  return `${genrePath}${fileName}`;
};



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
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isReading, setIsReading] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(null);
  const [creditsLeft, setCreditsLeft] = useState(null);

  const router = useRouter();

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // This ensures the user variable is properly set once a user logs in.
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
  
      if (currentUser) {
        const userDocRef = doc(firestoreDB, "users", currentUser.uid);
        const userSnap = await getDoc(userDocRef);
  
        if (userSnap.exists()) {
          const data = userSnap.data();
          setCreditsLeft(data.creditsToday ?? 0);
        }
      }
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



    if (authLoading) {
      return (
        <Layout>
          <div className="container">
            <p>Loading your profile...</p>
          </div>
        </Layout>
      );
    }
  


  // GENERATE STORY AI+ handle missing mandatry imput
  const handleGenerateAI = async () => {
    const newErrors = {};
  
    if (!user) {
      console.error("🚫 Cannot generate story: User not loaded yet.");
      setErrorMessage("Please wait... loading your profile.");
      return;
    }
  
    if (!age) {
      setErrorMessage("Tell us your age so we can make the story just right!");
      newErrors.age = "Please select an age range.";
    } else if (!genre) {
      setErrorMessage("We can't wait to create your story! Please select a genre.");
      newErrors.genre = "Please select a genre.";
    } else if (!length) {
      setErrorMessage("Big adventures or tiny tales? Pick a reading length!");
      newErrors.length = "Please select a reading length.";
    }
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    setErrors({});
    setErrorMessage('');
    setLoading(true);
  
    console.log("📤 Submitting to AI API with user:", user);
    if (!user || !user.uid) {
      console.error("❌ user or user.uid is missing:", user);
      setErrorMessage("We couldn't identify you. Please log in again.");
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid,
          age,
          genre,
          setting,
          moral,
          tone,
          length,
          character,
        }),
      });

      if (response.status === 403) {
        const errorData = await response.json();
        if (errorData.error === "No story credits left for today.") {
          setLoading(false);
          setShowAlertModal({
            type: "error",
            title: "😢 Out of Credits",
            message: "Sorry, you’ve used all your story credits for today. Come back tomorrow or upgrade your plan.",
            onConfirm: () => {
              setShowAlertModal(null);
              router.push("/parent/subscription");
            },
            onClose: () => setShowAlertModal(null),
            confirmLabel: "View Plans",
          });
          return;
        }
      }      
  
      const data = await response.json();
      const generatedStory = data.response;
  
      if (!generatedStory) {
        setErrorMessage("We couldn’t generate your story. Please try again later.");
        return;
      }
  
      setStory(generatedStory);
  
      const titleLine = generatedStory.split('\n')[0]
        .replace(/^"|"$/g, '')
        .replace(/\*\*/g, '')
        .trim();
  
      setStoryName(titleLine);
    } catch (error) {
      console.error("❌ Error generating story:", error);
      setStory("Error: Could not generate story.");
    }
  
    setLoading(false);
  };
  
  
 // AUDIO
 const handleConvertToAudio = async () => {
  if (!story.trim()) return alert("Please generate a story first!");

  const cleanedStory = story.replace(/\*\*/g, '').trim();

  if (!isReading) {
    await speakWithUserVoice(cleanedStory, () => setIsReading(false));
    setIsReading(true);
  } else {
    stopSpeech();
    setIsReading(false);
  }
};


const handleResumeAudio = () => {
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
};
const handleStopAudio = () => {
  window.speechSynthesis.cancel();
};


  
const handleBack = () => router.push('/parent/my-stories');


// CREATE STORY
const handleSaveStory = () => {
  if (!story.trim()) return alert("Please generate a story first!");
  setShowModal(true);
};

const confirmSave = async () => {
  if (!user) return alert("You need to be logged in to save stories.");
  if (!storyName.trim()) return alert("Please enter a title for your story.");

  const randomImageUrl = pickRandomImageForGenre(genre);

  try {
    const storyDocRef = await addDoc(collection(firestoreDB, "stories"), {
      title: storyName,
      content: story,
      age, genre, setting, moral, tone, length, character,
      createdAt: new Date(),
      userId: user.uid,
      audioUrl,
      source: "ai",
      imageUrl: randomImageUrl,
      read: false,
      favourite: false,
      // No 'id' field yet
    });

    // Optionally update the story to include its own Firestore ID
    await updateDoc(storyDocRef, { id: storyDocRef.id });

    setSaveSuccess(true); // <-- show the pretty success modal
    
  } catch (error) {
    console.error("Error saving story:", error);
    alert("Failed to save story.");
  }
};

  return (
    <Layout>
      
      <StoryPageTour />  {/* Tutorial when the user enter for the first time on this page */}
      <div className="container">
        
        <h1 className="title">Create Your Story</h1>

        {creditsLeft !== null && (
        <div className="credit-info-right">
          🪙 <strong>{creditsLeft}</strong>
        </div>
        )}

        <select 
          value={age} 
          onChange={(e) => {
            setAge(e.target.value);
            if (errors.age) {
              setErrors((prev) => ({ ...prev, age: null }));
            }
          }}
          className={`age-input ${errors.age ? 'input-error' : ""}`}
        >
          <option value="">* Age</option>
          <option value="Under 3">Under 3</option>
          <option value="3-5">3-5</option>
          <option value="6-8">6-8</option>
          <option value="9-11">9-11</option>
          <option value="12-14">12-14</option>
        </select>

        <select
          value={genre}
          onChange={(e) => {
            setGenre(e.target.value);
            if (errors.genre) {
              setErrors((prev) => ({ ...prev, genre: null }));
            }
          }}
          className={`genre-input ${errors.genre ? "input-error" : ""}`}
        >
          <option value="">* Genre</option>
          <option value="Fantasy">Fantasy</option>
          <option value="Adventure">Adventure</option>
          <option value="Science Fiction">Science Fiction</option>
          <option value="Mystery">Mystery</option>
          <option value="Humor">Humor</option>
          <option value="Historical Fiction">Historical Fiction</option>
          <option value="Animal Stories">Animal Stories</option>
        </select> 


        <select 
          value={setting} 
          onChange={(e) => {
            setSetting(e.target.value);
            if (errors.setting) {
              setErrors((prev) => ({ ...prev, setting: null }));
            }
          }}
          className={`optional-fields ${errors.setting ? "input-error" : ""}`}
        >
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


          <select 
            value={moral} 
            onChange={(e) => {
              setMoral(e.target.value);
              if (errors.moral) {
                setErrors((prev) => ({ ...prev, moral: null }));
              }
            }}
            className={errors.moral ? "input-error" : ""}
          >
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


          <select 
            value={tone} 
            onChange={(e) => {
              setTone(e.target.value);
              if (errors.tone) {
                setErrors((prev) => ({ ...prev, tone: null }));
              }
            }}
            className={errors.tone ? "input-error" : ""}
          >
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

          <select 
            value={length} 
            onChange={(e) => {
              setLength(e.target.value);
              if (errors.length) {
                setErrors((prev) => ({ ...prev, length: null }));
              }
            }}
            className={`reading-lenght-input ${errors.length ? "input-error" : ""}`}
          >
          <option value="">* Reading Length</option>
          <option value="Short (2 minutes)">Short (2 minutes)</option>
          <option value="Medium (5 minutes)">Medium (5 minutes)</option>
          <option value="Long (7 minutes)">Long (7 minutes)</option></select>

          <label htmlFor="character">Main Character</label>
          <input
            type="text"
            value={character}
            onChange={(e) => {
              setCharacter(e.target.value);
              if (errors.character) {
                setErrors((prev) => ({ ...prev, character: null }));
              }
            }}
            className={errors.character ? "input-error" : ""}
          />

        <div className="actions">

        {!story && (
            <>
              <button onClick={() => router.push('/parent/dashboard')} className="button button-secondary">
              ↩ Back
              </button>

              <button onClick={handleGenerateAI} className="button button-primary generate-button" disabled={loading}>
               🎔 Generate Story
              </button>

              <button onClick={() => router.push('/parent/write-story')} className="button button-primary write-own-button">
               𓂃🖊 Create Your Own Story
              </button>

            </>
          )}

          {story && (
            <>
              <button onClick={handleBack} className="button button-secondary">↩ Back</button>
              <button onClick={handleSaveStory} className="button button-primary">🖫 Save Story</button>
              <button onClick={handleConvertToAudio} className="button button-primary">
                {isReading ? "⏹ Stop Reading" : "▶ Read Aloud"}
              </button>

            </>
          )}
        </div>

        {story && (
          <div className="generated-story">
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
              {!saveSuccess ? (
                <>
                  <h2 className="success-heading">💜 Name Your Story</h2>
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
                </>
              ) : (
                <>

                  {/* SAVE STORY MESSAGE */}
                  <h2 className="success-heading">🎉 Story Saved Successfully!</h2>
                  <p>Your story <strong>“{storyName}”</strong> has been saved and is now in <strong>My Stories</strong>.</p>
                  <div className="modal-actions">
                    <button
                      className="button button-primary"
                      onClick={() => {
                        setShowModal(false);
                        setSaveSuccess(false);
                        setStory(''); setStoryName('');
                        setAge(''); setGenre(''); setSetting('');
                        setMoral(''); setTone(''); setLength(''); setCharacter('');
                        setAudioUrl('');
                        router.push('/parent/my-stories');
                      }}
                    >
                      OK
                    </button>
                  </div>


                </>
              )}
            </div>
          </div>
        )}


        {showAlertModal && (
          <AlertModal
            type={showAlertModal.type}
            title={showAlertModal.title}
            message={showAlertModal.message}
            onConfirm={showAlertModal.onConfirm}
            onClose={showAlertModal.onClose}
            confirmLabel={showAlertModal.confirmLabel}
            emoji={null} // 👈 disable emoji explicitly
          />
        )}


        {errorMessage && (
          <p className="friendly-error-message">{errorMessage}</p>
        )}


      </div>
    </Layout>
  );
}










