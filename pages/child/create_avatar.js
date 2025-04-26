// pages/child/create_avatar.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../../context/UserContext';
import Layout from '../../components/Layout';
import Image from 'next/image';
import { updateUserAvatar } from '../../firebase/firestore/updateUserAvatar'; 
import '../../styles/create_avatar.css';

// Just store avatar IDs, not full paths
const avatarIds = [
  'avatar1', 'avatar2', 'avatar3', 'avatar4',
  'avatar5', 'avatar6', 'avatar7', 'avatar8',
  'avatar9', 'avatar10', 'avatar11', 'avatar12',
  'avatar13',
];

export default function CreateAvatar() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || avatarIds[0]);

  const handleConfirm = async () => {
    if (!user) return;

    try {
      await updateUserAvatar(user.userId, selectedAvatar);

      // Update local context to reflect change without refresh
      setUser({ ...user, avatar: selectedAvatar });

      router.push('/child/dashboard');
    } catch (err) {
      console.error("Failed to update avatar:", err);
    }
  };

  return (
    <Layout>
      <div className="container">
        <h2>CREATE AVATAR</h2>

        <div className="avatar-grid">
          {avatarIds.map((id) => (
            <div
              key={id}
              className={`avatar-box ${selectedAvatar === id ? 'selected' : ''}`}
              onClick={() => setSelectedAvatar(id)}
            >
              <Image
                src={`/assets/avatars/${id}.png`}
                alt={`Avatar ${id}`}
                width={100}
                height={100}
              />
            </div>
          ))}
        </div>

        <div className="preview">
          <Image
            src={`/assets/avatars/${selectedAvatar}.png`}
            alt="Selected Avatar"
            width={160}
            height={160}
          />
        </div>

        <div className="button-row">
          <button className="button button-secondary" onClick={() => router.back()}>
            Go back
          </button>
          <button className="button button-primary" onClick={handleConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </Layout>
  );
}
