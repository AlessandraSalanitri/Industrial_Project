// pages/child/story-player.js
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

export default function StoryPlayer() {
  const router = useRouter();
  const { id } = router.query;

  // Dummy audio source – in a real app, you’d fetch the correct audio URL
  const audioSrc = `/audio/story-${id}.mp3`;

  return (
    <Layout>
      <div className="container">
        <h1>Story Player</h1>
        <p>Playing story ID: {id}</p>
        <audio controls src={audioSrc}>
          Your browser does not support the audio element.
        </audio>
      </div>
      <style jsx>{`
        .container {
          padding: 20px;
        }
      `}</style>
    </Layout>
  );
}
