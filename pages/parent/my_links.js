import { useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';
import { firestoreDB } from '../../firebase/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Layout from '../../components/Layout';
import { useRouter } from 'next/router';
import '../../styles/my_links.css';

export default function MyLinks() {
  const { user, loading } = useUser();
  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user?.userId) {
      console.warn('User not found!');
      setFetching(false);
      return;
    }

    const fetchLinks = async () => {
      try {
        const q = query(
          collection(firestoreDB, 'linkedAccounts'),
          where('parentId', '==', user.userId)
        );
        const snapshot = await getDocs(q);
        const links = snapshot.docs.map(doc => doc.data().childEmail);
        setLinkedAccounts(links);
      } catch (err) {
        console.error('Error fetching linked accounts:', err);
      } finally {
        setFetching(false);
      }
    };

    fetchLinks();
  }, [user, loading]);

  if (loading || fetching) return <Layout><p>Loading...</p></Layout>;

  return (
    <Layout>
      <div className="container">
        <h2 className="page-title">Linked Accounts</h2>
        {linkedAccounts.length === 0 ? (
          <p className="no-links">No linked accounts found.</p>
        ) : (
          <table className="links-table">
            <thead>
              <tr>
                <th></th>
                <th>Child Email</th>
              </tr>
            </thead>
            <tbody>
              {linkedAccounts.map((email, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="link-actions">
          <button className="button button-primary" onClick={() => router.push('/parent/settings')}>
            Link Another Account
          </button>
        </div>
      </div>
    </Layout>
  );
}
