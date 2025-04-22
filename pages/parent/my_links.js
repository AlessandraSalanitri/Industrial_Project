import { useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';
import { firestoreDB } from '../../firebase/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Layout from '../../components/Layout';

export default function MyLinks() {
  const { user, loading } = useUser(); // user is coming from context
  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    // If the user is still loading, do not proceed
    if (loading) return;

    if (!user?.userId) { // userId should be used here instead of user?.uid
      console.warn('User not found!');
      setFetching(false);
      return;
    }

    // Function to fetch linked accounts
    const fetchLinks = async () => {
      try {
        const q = query(
          collection(firestoreDB, 'linkedAccounts'),
          where('parentId', '==', user.userId) // Use userId here instead of uid
        );
        const snapshot = await getDocs(q);
        console.log("Firestore query snapshot:", snapshot); // Log the snapshot

        const links = snapshot.docs.map(doc => doc.data().childEmail);
        console.log("Fetched linked accounts:", links); // Log the fetched linked accounts
        setLinkedAccounts(links);
      } catch (err) {
        console.error('Error fetching linked accounts:', err);
      } finally {
        setFetching(false);
      }
    };

    fetchLinks();
  }, [user, loading]); // Re-run whenever `user` or `loading` changes

  if (loading || fetching) return <Layout><p>Loading...</p></Layout>;

  return (
    <Layout>
      <div className="container">
        <h2 className="subtitle">Linked Accounts</h2>
        {linkedAccounts.length === 0 ? (
          <p className="no-links-found">No linked accounts found.</p>
        ) : (
          <ul className="linked-accounts">
            {linkedAccounts.map((email, index) => (
              <li key={index}>{email}</li>
            ))}
          </ul>
        )}

        <button className="link-button" onClick={() => alert('Link another child')}>Link Another Account</button>
      </div>
    </Layout>
  );
}
