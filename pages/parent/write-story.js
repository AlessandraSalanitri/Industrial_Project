// pages/parent/write-story.js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { firestoreDB } from '../../firebase/firebaseConfig'; 
// import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import {collection, addDoc, updateDoc, doc, setDoc, getDoc, deleteDoc} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
// import { v4 as uuidv4 } from 'uuid'; 
import '../../styles/create_story.css';  // reusing style
import '../../styles/alertmodal.css'
import CuteError from '../../components/CuteError';
import { useUser } from '../../context/UserContext';
import AlertModal from '../../components/AlertModal';
import { speakWithUserVoice } from '../../utils/tts';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation, Trans } from 'next-i18next';


export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

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
  // SAVE DRAFT-continue the story
  const { user, setUser } = useUser();
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [draftData, setDraftData] = useState(null);

  const router = useRouter();
  const { locale } = router;
  
  const [offlineError, setOfflineError] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(null);
  const { t } = useTranslation('common');

  const [creditsLeft, setCreditsLeft] = useState(null);


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

  // SAVE DRAFT-continue the story - conected to user
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(firestoreDB, "users", currentUser.uid);
        const userSnap = await getDoc(userDocRef);
  
        if (userSnap.exists()) {
          const data = userSnap.data();
          setCreditsLeft(data.creditsToday ?? 0);
  
          setUser({
            ...currentUser,
            ...data,
            userId: currentUser.uid,
          });
        } else {
          setUser(currentUser);
        }
  
        // 📝 Check for saved draft
        const draftRef = doc(firestoreDB, "drafts", currentUser.uid);
        try {
          const draftSnap = await getDoc(draftRef);
          if (draftSnap.exists()) {
            setDraftData(draftSnap.data());
            setShowResumeModal(true);
          }
        } catch (error) {
          console.error('Error fetching draft:', error);
          if (error.message.toLowerCase().includes('offline')) {
            setOfflineError(true);
          }
        }
      }
    });
  
    return () => unsubscribe();
  }, []);
  

// ✅ Show cute error page if offline
if (offlineError) {
  return <CuteError message="🌙 Your internet took a little nap." />;
}


  const handleBack = () => {
    router.push('/parent/create-story');
  };


// ✨ Random image picker based on genre
const pickRandomImageForGenre = (genre) => {
  const genrePath = `/assets/story-images/${genre}/`;  // keep original folder name

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

  const fileName = `${genre.replace(/\s/g, "_").toLowerCase()}${randomNumber}.jpg`;

  return `${genrePath}${fileName}`;
};




//   GENERATE NEXT IDEEA FOR THE STORY
const handleGenerateNext = async () => {
  const newErrors = {};
    console.log("🌍 Sending story continuation in locale:", locale);

  if (!title.trim()) {
    newErrors.title = t('Title is required');
    setErrorMessage(t('✨ A magical story needs a title to begin!'));
  } else if (!genre.trim()) {
    newErrors.genre = t('Genre is required');
    setErrorMessage(t('📚 Pick a genre so we know what kind of adventure to tell!'));
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
        userId: user?.uid,
        mode: "continue",
        title: title.trim(),
        genre: genre.trim(),
        storyText: storyText.trim(),
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

    // Handle failure in API response
    if (!response.ok || !data.response) {
      if (!navigator.onLine) {
        setOfflineError(true); // ⬅️ This shows the CuteError
        return;
      }
    
      // If it’s a general server error
      setErrorMessage("😢 Oops! We couldn’t generate your story right now. Try again soon.");
      return; // ⬅️ Make sure to stop execution
    }
    
    const nextPart = data.response;
    const updatedStory = storyText + "\n\n" + nextPart;
    setStoryText(updatedStory);
    setGenerated(true);

    // ✅ Refresh credits after generation
    const refreshedDoc = await getDoc(doc(firestoreDB, "users", user.uid));
    if (refreshedDoc.exists()) {
      const updatedUser = {
        ...user,
        ...refreshedDoc.data(),
        userId: user.uid,
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      // ✅ Live update credits display
      setCreditsLeft(updatedUser.creditsToday ?? 0);
    }

    // Save to Firestore draft
    if (user) {
      await setDoc(doc(firestoreDB, "drafts", user.uid), {
        title,
        genre,
        storyText: updatedStory,
      });
    }

  } catch (error) {
    console.error("Error generating next paragraph:", error);

    if (!navigator.onLine || error.message.toLowerCase().includes('offline')) {
      setOfflineError(true); // force CuteError if offline
    } else {
      setErrorMessage("😢 Oops! We couldn’t generate your story right now. Try again soon.");
    }    
  }

  setLoading(false);
};

  

// SAVING STORY LOGIC
  const handleSave = async () => {
    if (!user) {
      alert("You must be logged in to save your story.");
      return;
    }

    if (!title.trim() || !storyText.trim()) {
      setShowErrorModal(true);
      return;
    }

    try {
      const storyRef = await addDoc(collection(firestoreDB, "stories"), {
        title: title.trim(),
        content: storyText.trim(),
        genre: genre.trim() || "Unknown",
        audioUrl: "", // optional audio
        createdAt: new Date(),
        userId: user.uid,
        source: "manual",
        imageUrl: pickRandomImageForGenre(genre),
        favourite: false, // optional default
        read: false       // optional default
      });

      // ✅ Store Firestore-generated ID into the story document
      await updateDoc(storyRef, { id: storyRef.id });

      setShowSuccessModal(true);

      // ✅ Clean up any saved draft
      await deleteDoc(doc(firestoreDB, "drafts", user.uid));

    } catch (error) {
      console.error("❌ Error saving story:", error);
      alert("Failed to save your story. Please try again.");
    }
  };


  
  
// CONVERT TO AUDIO
const handleConvert = () => {
  if (!storyText.trim()) {
    setShowAudioErrorModal(true); 
    return;
  }

  const cleanedStory = storyText.replace(/\*\*/g, '').trim();

  if (!isReading) {
    speakWithUserVoice(cleanedStory, () => setIsReading(false));
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
        <h1>{t('Write Your Own Story')}</h1>

        {creditsLeft !== null && (
          <div className="credit-info-right">
            🪙 <strong>{user?.subscriptionPlan === "unlimited" ? "♾️" : creditsLeft}</strong>
          </div>
        )}

        {errorMessage && (
              <p className="friendly-error-message">{errorMessage}</p>
            )}
            
          <input
          type="text"
          value={title}
          placeholder={t('Enter your story title...')}
          onChange={(e) => {
            const newTitle = e.target.value;
            setTitle(newTitle);
            if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
            if (user) {
              setDoc(doc(firestoreDB, "drafts", user.uid), {
                title: newTitle,
                genre,
                storyText,
              });
            }
          }}
          className={errors.title ? "input-error" : ""}
        />




        <select
          value={genre}
          onChange={(e) => {
            const newGenre = e.target.value;
            setGenre(newGenre);
            if (errors.genre) setErrors((prev) => ({ ...prev, genre: null }));
            if (user) {
              setDoc(doc(firestoreDB, "drafts", user.uid), {
                title,
                genre: newGenre,
                storyText,
              });
            }
          }}
          
          className={errors.genre ? "input-error" : ""}
        >
          <option value="">{t('Select Genre')}</option>
          <option value="Fantasy">{t('Fantasy')}</option>
          <option value="Adventure">{t('Adventure')}</option>
          <option value="Mystery">{t('Mystery')}</option>
          <option value="Science Fiction">{t('Science Fiction')}</option>
          <option value="Historical Fiction">{t('Historical Fiction')}</option>
          <option value="Animal Stories">{t('Animal Stories')}</option>
          <option value="Humor">{t('Humor')}</option>
        </select>

        <div className="generated-story">
        <textarea
        value={storyText}
        onChange={(e) => {
          const newText = e.target.value;
          setStoryText(newText);
          if (user) {
            setDoc(doc(firestoreDB, "drafts", user.uid), {
              title,
              genre,
              storyText: newText,
            });
          }
        }}
        placeholder={t('Start writing your magical bedtime story here...')}
      />

        </div>

        <div className="actions">

        <button onClick={handleBack} className="button button-secondary">
          ↩ {t('Back')}
        </button>

        <button onClick={handleGenerateNext} className="button button-primary">
          ↻ {t('Generate Next')}
        </button>

        <button onClick={handleSave} className="button button-primary">
          🖫 {t('Save Story')}
        </button>

        <button onClick={handleConvert} className="button button-primary">
          {isReading ? t('⏹ Stop Reading') : t('▶ Read Aloud')}
        </button>

        </div>


            {/* SAVE STORY MESSAGE */}
            {showSuccessModal && (
              <AlertModal
                type="success"
                title={t('Story Saved Successfully!')}
                message={
                  <span>
                    {t('Your story')} <strong>“{title || t('Untitled Story')}”</strong> {t('has been saved and is now in')} <strong>My Stories</strong>.
                  </span>
                }
                onConfirm={() => {
                  setShowSuccessModal(false);
                  setStoryText('');
                  setTitle('');
                  setGenre('');
                  window.location.href = '/parent/my-stories';
                }}
                confirmLabel={t('OK')}
                emoji="🎉"
              />
            )}



            {/* POP UP MESSAGE IF THE REQ FIELDS ARE NOT COMPLETED WHEN SAVING*/}
            {showErrorModal && (
              <AlertModal
                type="error"
                title={t('Incomplete Story')}
                message={
                  <span>
                    <Trans i18nKey="incompleteStoryMessage">
                      Please make sure your story has a <strong>title</strong> and some <strong>text</strong> before saving.
                    </Trans>
                  </span>
                }
                onConfirm={() => setShowErrorModal(false)}
                confirmLabel={t('OK')}
                emoji="🚨"
              />
            )}


            {/* ERROR MESSAGE AUDIO IF NO TEXT */}
            {showAudioErrorModal && (
              <AlertModal
                type="error"
                title={t('Incomplete Story')}
                message={
                  <Trans i18nKey="audioErrorMessage">
                    Please write or generate some <strong>story text</strong> before using <strong>Read Aloud</strong>.
                  </Trans>
                }
                onConfirm={() => setShowAudioErrorModal(false)}
                confirmLabel={t('OK')}
                emoji="🚨"
              />
            )}




            {showResumeModal && (
              <div className="modal-backdrop">
                <div className="modal-content">
                  <h2 className="modal-title">📝 {t('Resume Your Draft?')}</h2>
                  <p>{t('resumeMessage')}</p>
                  <div className="modal-actions">
                    <button
                      className="button button-primary"
                      onClick={() => {
                        setTitle(draftData.title || '');
                        setGenre(draftData.genre || '');
                        setStoryText(draftData.storyText || '');
                        setShowResumeModal(false);
                      }}
                    >
                      {t('Yes, Resume')}
                    </button>
                    <button
                      className="button button-secondary"
                      onClick={async () => {
                        await deleteDoc(doc(firestoreDB, "drafts", user.uid));
                        setShowResumeModal(false);
                      }}
                    >
                      {t('No, Start Fresh')}
                    </button>
                  </div>
                </div>
              </div>
            )}

        {/* OUT OF CREDIT MESSAGE */}
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



      </div>
    </Layout>
  );
}
