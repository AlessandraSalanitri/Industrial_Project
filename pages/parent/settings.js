import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { firebaseAuth, firestoreDB } from '../../firebase/firebaseConfig'; // Import firestoreDB
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore'; // Import Firestore functions
import Image from 'next/image';
import '../../styles/settings.css';

const voicesList = [
  { name: "Rachel", id: "21m00Tcm4TlvDq8ikWAM", avatar: 'rachel.png' },
  { name: "Domi", id: "AZnzlk1XvdvUeBnXmlld", avatar: 'domi.png' },
  { name: "Sarah", id: "EXAVITQu4vr4xnSDxMaL", avatar: 'sarah.png' },
  { name: "Elli", id: "MF3mGyEYCl7XYWbV9V6O", avatar: 'elli.png' },
  { name: "Alice", id: "Xb7hH8MSUJpSbSDYk0k2", avatar: 'alice.png' },
  { name: "Patrick", id: "ODq5zmih8GrVes37Dizd", avatar: 'patrick.png' },
  { name: "Harry", id: "SOYHLrjzK2X1ezoPC6cr", avatar: 'harry.png' },
  { name: "Josh", id: "TxGEqnHWrfWFTfGW9XjX", avatar: 'josh.png' },
  { name: "Jeremy", id: "bVMeCyTHy58xNoL34h3p", avatar: 'jeremy.png' },
];


export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [childEmail, setChildEmail] = useState('');
  const [user, setUser] = useState(null); // State to hold the current user data
  const [previewingVoice, setPreviewingVoice] = useState(''); // Avatar Voice when voice preview is playing
  const router = useRouter();

  useEffect(() => {
    // Check if the user is authenticated and set the user state
    const currentUser = firebaseAuth.currentUser;
    if (currentUser) {
      setUser(currentUser); // Set user if logged in
    } else {
      router.push('/login'); // Redirect to login if no user is found
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  const handleVoicePreview = async (voiceName) => {

    try {
      setPreviewingVoice(voiceName);  // Set the previewing voice to trigger animation

      const voiceIdMap = {
        "Rachel": "21m00Tcm4TlvDq8ikWAM",
        "Domi": "AZnzlk1XvdvUeBnXmlld",
        "Sarah": "EXAVITQu4vr4xnSDxMaL",
        "Elli": "MF3mGyEYCl7XYWbV9V6O",
        "Alice": "Xb7hH8MSUJpSbSDYk0k2",

        "Patrick": "ODq5zmih8GrVes37Dizd",
        "Harry": "SOYHLrjzK2X1ezoPC6cr",
        "Josh": "TxGEqnHWrfWFTfGW9XjX",
        "Jeremy": "bVMeCyTHy58xNoL34h3p",
      };
  
      const voiceId = voiceIdMap[voiceName];
      const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
  
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text: "Hi there! I'm your bedtime narrator!",
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });
  
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.play();

      audio.onended = () => {
        setPreviewingVoice(''); // Reset previewing voice when audio ends
      }
      
      // Fallback timeout in case `onended` doesn't fire
      setTimeout(() => setPreviewingVoice(''), 20000);

    } catch (err) {
      console.error("Failed to preview voice:", err);
      alert("Failed to preview the voice. Please try again.");
    }
  };

  const handleVoiceSelect = async (voiceName) => {
    setSelectedVoice(voiceName);
    const selected = voicesList.find((v) => v.name === voiceName); // 
  
    try {
      if (user && selected) {
        const userDocRef = doc(firestoreDB, "users", user.uid);
        await updateDoc(userDocRef, {
          selectedVoice: {
            name: selected.name,
            id: selected.id,
          },
        });
        alert(`Your choice has been saved! "${selected.name}" will read your stories now.`);
      }
    } catch (error) {
      console.error("Failed to save selected voice:", error);
      alert("Failed to save voice.");
    }
  };
  

  const handleChildLink = async () => {
    if (!childEmail) {
      alert('Please enter a valid email.');
      return;
    }

    if (!user) {
      alert('You must be signed in to link an account.');
      return;
    }

    try {
      // Reference to the Firestore collection where linked accounts are stored
      const linkedAccountsRef = collection(firestoreDB, 'linkedAccounts');
      
      // Add a new document with the user's ID and the child's email
      await addDoc(linkedAccountsRef, {
        parentId: user.uid,
        childEmail: childEmail,
      });

      // Provide feedback to the user
      alert(`Child account linked with: ${childEmail}`);

      // Clear the input after linking
      setChildEmail('');
    } catch (error) {
      console.error('Error linking child account:', error);
      alert('There was an error linking the account. Please try again.');
    }
  };

  return (
    <Layout>
      <div className="container settings-container">
        <h2 className="settings-title">SETTINGS</h2>

        {/* Mode Toggle */}
        <div className="setting-row">
          <span className="setting-label">Choose light or dark mode</span>
          <div className="toggle-group">
            <button className={`toggle-btn ${!darkMode ? 'active' : ''}`} onClick={() => setDarkMode(false)}>Light</button>
            <button className={`toggle-btn ${darkMode ? 'active' : ''}`} onClick={() => setDarkMode(true)}>Dark</button>
          </div>
        </div>

        {/* Voice Selection */}
        <div className="setting-section">
          <h3>Speech Settings</h3>
          <div className="voice-grid">
            {voicesList.map((voice) => (

            <div key={voice.name} className={`voice-card ${selectedVoice === voice.name ? 'selected' : ''}`}>
              <p>{voice.name}</p>

            {/* Avatar Image */}
            {previewingVoice === voice.name && (
               <div className={`voice-avatar ${previewingVoice === voice.name ? 'animated' : ''}`}>
                <Image
                  src={`/assets/voicesPersona/${voice.avatar}`} // Path to the image                  
                  alt={`${voice.name} Avatar`} 
                  width={180} 
                  height={100} 
                  priority={true} // prioritize loading for LCP
                />
              </div>

              
            )}

                <button className="button button-secondary" onClick={() => handleVoicePreview(voice.name)}>
                  Hear Voice
                </button>
                <button className="button button-primary" onClick={() => handleVoiceSelect(voice.name)}>
                  Select Voice
                </button>
              </div>
          ))}
          </div>
        </div>

        {/* Parental Control */}
        <div className="setting-section">
          <h3>Parental Control</h3>
          <div className="link-child-container">
            <input
              type="email"
              placeholder="Enter child's email"
              value={childEmail}
              onChange={(e) => setChildEmail(e.target.value)}
            />
            <button className="button button-primary" onClick={handleChildLink}>
              Link Account
            </button>
          </div>

          <div className="info-box">
            <h4>Why Link Your Account?</h4>
            <p>
              Linking your account with your child’s helps personalize their storytelling experience.
              When you create or edit stories, or choose a preferred narration voice, these changes
              will automatically reflect in your child’s account, ensuring they always enjoy the
              stories the way you intended. It’s a simple way to stay connected and enhance their
              bedtime experience with just one click.
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="button-row">
          <button className="button button-secondary" onClick={() => window.history.back()}>Go back</button>
          <button className="button button-primary" onClick={() => alert('Settings saved!')}>Confirm</button>
        </div>
      </div>
    </Layout>
  );
}
