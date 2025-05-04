// Text-to-Speech (TTS) utility functions for handling speech synthesis in the app
// reusable functions for fetching user voice preferences, loading available voices, and speaking text with the selected voice.
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firestoreDB } from '../firebase/firebaseConfig';

// 🔹 Fetch the user's selected voice from Firestore
export const fetchUserSelectedVoice = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.warn('[TTS] No user is currently signed in.');
    return null;
  }

  try {
    const userDocRef = doc(firestoreDB, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      return userDocSnap.data().selectedVoice; 
    } else {
      console.warn('[TTS] User document does not exist.');
      return null;
    }
  } catch (error) {
    console.error('[TTS] Error fetching user voice preference:', error);
    return null;
  }
};

export const loadVoices = () =>
  new Promise((resolve) => {
    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    if (voices.length) {
      resolve(voices);
    } else {
      synth.onvoiceschanged = () => resolve(synth.getVoices());
    }
  });

// Main method to speak using selected voice
export const speakWithUserVoice = async (text, onEndCallback = null) => {
  const selectedVoice = await fetchUserSelectedVoice();
  const voices = await loadVoices();

  const voice = voices.find(
    (v) => v.name === selectedVoice?.name && v.lang === selectedVoice?.lang
  );

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice || null; // fallback
  utterance.lang = selectedVoice?.lang || 'en-GB';
  utterance.rate = 1;
  utterance.pitch = 1;

  if (onEndCallback) {
    utterance.onend = onEndCallback;
  }

  window.speechSynthesis.cancel(); // stop any previous
  window.speechSynthesis.speak(utterance);
};

// Pause, Resume, Stop
export const pauseSpeech = () => window.speechSynthesis.pause();
export const resumeSpeech = () => window.speechSynthesis.resume();
export const stopSpeech = () => window.speechSynthesis.cancel();
