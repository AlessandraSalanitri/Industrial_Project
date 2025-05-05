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
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation, Trans } from 'next-i18next';

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}


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
  const { t } = useTranslation('common');


  const router = useRouter();

  const { locale } = useRouter();
  
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
            <p>{t('loadingYourProfile...')}</p>
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
      setErrorMessage(t('error.ageMissing'));
      newErrors.age = t('error.selectAge');
    } else if (!genre) {
      setErrorMessage(t('error.genreMissing'));
      newErrors.genre = t('error.selectGenre');
    } else if (!length) {
      setErrorMessage(t('error.lengthMissing'));
      newErrors.length = t('error.selectLength');
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
          locale,
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
        
        <h1 className="title">{t('createYourStory')}</h1>

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
          <option value="">* {t('age')}</option>
          <option value="Under 3"> {t('under')} 3</option>
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
        <option value="">{t('* Genre')}</option>
        <option value="Fantasy">{t('Fantasy')}</option>
        <option value="Adventure">{t('Adventure')}</option>
        <option value="Science Fiction">{t('Science Fiction')}</option>
        <option value="Mystery">{t('Mystery')}</option>
        <option value="Humor">{t('Humor')}</option>
        <option value="Historical Fiction">{t('Historical Fiction')}</option>
        <option value="Animal Stories">{t('Animal Stories')}</option>
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
          <option value="">{t('Setting')}</option>
          <option value="Fantasy">{t('Fantasy')}</option>
          <option value="Adventure">{t('Adventure')}</option>
          <option value="Science Fiction">{t('Science Fiction')}</option>
          <option value="Mystery">{t('Mystery')}</option>
          <option value="Historical">{t('Historical')}</option>
          <option value="Modern-Day">{t('Modern-Day')}</option>
          <option value="Urban">{t('Urban')}</option>
          <option value="Urban Fantasy">{t('Urban Fantasy')}</option>
          <option value="Animal-Based">{t('Animal-Based')}</option>
          <option value="Magical Realism">{t('Magical Realism')}</option>
          <option value="Survival">{t('Survival')}</option>

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
          <option value="">{t('Moral')}</option>
          <option value="Friendship and Teamwork">{t('Friendship & Teamwork')}</option>
          <option value="Courage and Bravery">{t('Courage & Bravery')}</option>
          <option value="Kindness and Empathy">{t('Kindness & Empathy')}</option>
          <option value="Honesty and Integrity">{t('Honesty & Integrity')}</option>
          <option value="Perseverance and Hard Work">{t('Perseverance & Hard Work')}</option>
          <option value="Responsibility and Accountability">{t('Responsibility & Accountability')}</option>
          <option value="Self-Respect and Confidence">{t('Self-Respect & Confidence')}</option>
          <option value="Fairness and Justice">{t('Fairness & Justice')}</option>
          <option value="Patience and Temperance">{t('Patience & Temperance')}</option>
          <option value="Gratitude and Contentment">{t('Gratitude & Contentment')}</option>
          <option value="Environmental Awareness">{t('Environmental Awareness')}</option>
          <option value="Creativity and Imagination">{t('Creativity & Imagination')}</option>

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
          <option value="">{t('Tone')}</option>
          <option value="Lighthearted and Fun">{t('Lighthearted & Fun')}</option>
          <option value="Serious and Reflective">{t('Serious & Reflective')}</option>
          <option value="Adventurous and Exciting">{t('Adventurous & Exciting')}</option>
          <option value="Mysterious and Suspenseful">{t('Mysterious & Suspenseful')}</option>
          <option value="Optimistic and Hopeful">{t('Optimistic & Hopeful')}</option>
          <option value="Funny and Humorous">{t('Funny & Humorous')}</option>
          <option value="Romantic and Heartfelt">{t('Romantic & Heartfelt')}</option>
          <option value="Educational and Informative">{t('Educational & Informative')}</option>
          <option value="Fantasy and Magical">{t('Fantasy & Magical')}</option>
          <option value="Heroic and Noble">{t('Heroic & Noble')}</option>

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
            <option value="">{t('* Reading Length')}</option>
            <option value="Short (2 minutes)">{t('Short (2 minutes)')}</option>
            <option value="Medium (5 minutes)">{t('Medium (5 minutes)')}</option>
            <option value="Long (7 minutes)">{t('Long (7 minutes)')}</option>
          </select>

          <label htmlFor="character">{t('Main Character')}</label>

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
              ↩ {t('Back')}
            </button>

            <button onClick={handleGenerateAI} className="button button-primary generate-button" disabled={loading}>
              🎔 {t('Generate Story')}
            </button>

            <button onClick={() => router.push('/parent/write-story')} className="button button-primary write-own-button">
              𓂃🖊 {t('Create Your Own Story')}
            </button>
            </>
          )}

          {story && (
            <>
            <button onClick={handleBack} className="button button-secondary">
              ↩ {t('Back')}
            </button>

            <button onClick={handleSaveStory} className="button button-primary">
              🖫 {t('Save Story')}
            </button>

            <button onClick={handleConvertToAudio} className="button button-primary">
              {isReading ? t('⏹ Stop Reading') : t('▶ Read Aloud')}
            </button>

            </>
          )}
        </div>

        {story && (
          <div className="generated-story">
            {storyName && (
              <div className="story-title">
                <MoonStars size={28} weight="fill" className="moon-icon" />
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
                  <h2 className="success-heading">💜 {t('Name Your Story')}</h2>
                  <input
                    type="text"
                    placeholder="Whiskers in Wonderwood..."
                    value={storyName}
                    onChange={(e) => setStoryName(e.target.value)}
                  />
                  <div className="modal-actions">
                  <button className="button button-primary" onClick={confirmSave}>
                    {t('Save')}
                  </button>
                  <button className="button button-secondary" onClick={() => setShowModal(false)}>
                    {t('Cancel')}
                  </button>

                  </div>
                </>
              ) : (
                <>

                  {/* SAVE STORY MESSAGE */}
                  <h2 className="success-heading">🎉 {t('Story Saved Successfully!')}</h2>

                    <p>
                      <Trans i18nKey="storySavedMessage" values={{ storyName }}>
                        Your story <strong>“{{storyName}}”</strong> has been saved and is now in <strong>My Stories</strong>.
                      </Trans>
                    </p>

                    <div className="modal-actions">
                      <button
                        className="button button-primary"
                        onClick={() => {
                          setShowModal(false);
                          setSaveSuccess(false);
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
                          router.push('/parent/my-stories');
                        }}
                      >
                        {t('OK')}
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
            emoji={null} // 👈 disable emoji
          />
        )}

        {errorMessage && (
          <p className="friendly-error-message">{errorMessage}</p>
        )}

      </div>
    </Layout>
  );
}










