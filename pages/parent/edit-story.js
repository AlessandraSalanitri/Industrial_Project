import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { firestoreDB } from '../../firebase/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import '../../styles/create_story.css';

export default function EditStory() {
  const router = useRouter();
  const { id } = router.query;

  const [story, setStory] = useState('');
  const [storyName, setStoryName] = useState('');
  const [age, setAge] = useState('');
  const [genre, setGenre] = useState('');
  const [setting, setSetting] = useState('');
  const [moral, setMoral] = useState('');
  const [tone, setTone] = useState('');
  const [length, setLength] = useState('');
  const [character, setCharacter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const loadStory = async () => {
        const docRef = doc(firestoreDB, 'stories', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setStoryName(data.title || '');
          setStory(data.content || '');
          setAge(data.age || '');
          setGenre(data.genre || '');
          setSetting(data.setting || '');
          setMoral(data.moral || '');
          setTone(data.tone || '');
          setLength(data.length || '');
          setCharacter(data.character || '');
        } else {
          alert('Story not found.');
          router.push('/parent/my-stories');
        }
      };

      loadStory();
    }
  }, [id]);

  const handleUpdateStory = async () => {
    if (!story.trim()) {
      alert("Story can't be empty.");
      return;
    }

    setLoading(true);

    try {
      const docRef = doc(firestoreDB, 'stories', id);
      await updateDoc(docRef, {
        title: storyName,
        content: story,
        age,
        genre,
        setting,
        moral,
        tone,
        length,
        character,
      });

      alert('Story updated successfully!');
      router.push('/parent/my-stories');
    } catch (error) {
      console.error('Error updating story:', error);
      alert('Failed to update story.');
    }

    setLoading(false);
  };

  return (
    <Layout>
      <div className="container">
        <h1>Edit Story</h1>

        <input
          type="text"
          placeholder="Story Title"
          value={storyName}
          onChange={(e) => setStoryName(e.target.value)}
        />

        <select value={age} onChange={(e) => setAge(e.target.value)}>
          <option value="">Child's Age</option>
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
          placeholder="e.g., Luna the clumsy dragon"
          value={character}
          onChange={(e) => setCharacter(e.target.value)}
        />

        <label htmlFor="story">Story</label>
        <textarea
          id="story"
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="Edit your story here..."
        ></textarea>

        <div className="actions">
          <button onClick={handleUpdateStory} className="btn" disabled={loading}>
            {loading ? 'Updating...' : 'Update Story'}
          </button>
          <button className="btn" onClick={() => router.back()}>Back</button>
        </div>
      </div>
    </Layout>
  );
}
