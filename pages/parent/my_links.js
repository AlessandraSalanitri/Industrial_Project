import { useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';
import { firestoreDB } from '../../firebase/firebaseConfig';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
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
        const links = snapshot.docs.map(doc => ({
          id: doc.id,
          childEmail: doc.data().childEmail,
        }));
        setLinkedAccounts(links);
      } catch (err) {
        console.error('Error fetching linked accounts:', err);
      } finally {
        setFetching(false);
      }
    };

    fetchLinks();
  }, [user, loading]);

  const handleDelete = async (accountId) => {
    try {
      // Delete the linked account from Firestore
      await deleteDoc(doc(firestoreDB, 'linkedAccounts', accountId));
      // Remove from the local state as well
      setLinkedAccounts(prevState => prevState.filter(account => account.id !== accountId));
      alert("Account deleted successfully!");
    } catch (err) {
      console.error("Error deleting account:", err);
      alert("Failed to delete account.");
    }
  };

  if (loading || fetching) return <Layout><p>Loading...</p></Layout>;

  return (
    <Layout>
      <div className="container">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          {/* Back to Dashboard Button */}
          <button className="button button-primary" onClick={() => router.push('/parent/dashboard')}>
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </button>

          {/* Link Another Account Button */}
          <button className="button button-primary" onClick={() => router.push('/parent/settings')}>
            <i className="fas fa-link"></i> Link Another Account
          </button>
        </div>

        <h3 className="page-title">Linked Accounts</h3>

        {linkedAccounts.length === 0 ? (
          <p className="no-links">No linked accounts found.</p>
        ) : (
          <table className="links-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Child Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {linkedAccounts.map((account, i) => (
                <tr key={account.id}>
                  <td>{i + 1}</td>
                  <td>{account.childEmail}</td>
                  <td>
                    {/* Delete Button */}
                    <button
                      className="button button-danger"
                      onClick={() => handleDelete(account.id)}
                    >
                      <i className="fas fa-trash-alt"></i> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Link Actions */}
        <div className="link-actions">
          <button className="button button-primary" onClick={() => router.push('/parent/settings')}>
            <i className="fas fa-link"></i> Link Another Account
          </button>
          <button className="button button-primary" onClick={() => router.push('/parent/dashboard')}>
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </button>
        </div>
      </div>
    </Layout>
  );
}
