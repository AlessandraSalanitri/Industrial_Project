import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { firebaseAuth, firestoreDB } from "../../firebase/firebaseConfig";
import Layout from '../../components/Layout';
import Image from 'next/image';
import Link from 'next/link';
import '../../styles/parent_dashboard.css';

export default function ParentDashboard() {
  const switchToChildMode = async () => {
    const currentUser = firebaseAuth.currentUser;
  
    if (!currentUser) {
      console.error("No authenticated user found.");
      return;
    }
  
    const parentEmail = currentUser.email;
    const parentId = currentUser.uid;
    const simulatedChildEmail = `${parentEmail}-child@simulated.com`;
  
    try {
      // Check if the link already exists
      const linkedQuery = query(
        collection(firestoreDB, "linkedAccounts"),
        where("childEmail", "==", simulatedChildEmail)
      );
      const snapshot = await getDocs(linkedQuery);
  
      if (snapshot.empty) {
        await addDoc(collection(firestoreDB, "linkedAccounts"), {
          childEmail: simulatedChildEmail,
          parentId: parentId,
        });
        console.log("Simulated child link created.");
      }
  
      // Inform UserContext this is a simulated session
      localStorage.setItem('mode', 'child');
  
      // Redirect to child dashboard
      window.location.href = "/child/dashboard";
    } catch (error) {
      console.error("Error linking simulated child account:", error);
    }
  };
  

  return (
    <Layout>
      <div className="admin-dashboard">
        <h1 className="dashboard-title">Admin Dashboard</h1>

        <div className="dashboard-actions">
          {/* Create story card */}
          <div className="dashboard-card">
            <Image
              src="/assets/create_story.png"
              alt="Create New Story"
              width={280}
              height={320}
              className="dashboard-image"
            />
            <Link href="/parent/create-story" className="button button-primary">
              Create new story
            </Link>
          </div>

          {/* Manage story saved card */}
          <div className="dashboard-card">
            <Image
              src="/assets/saved_story.png"
              alt="Manage Saved Story"
              width={280}
              height={320}
              className="dashboard-image"
            />
            <Link href="/parent/my-stories" className="button button-primary">
              Manage saved story
            </Link>
          </div>

          {/* Redirect to child dashboard with parent account -- can exit the child account and go back to parent through exit in avatar panel*/}
          <div className="dashboard-card">
            <Image
              src="/assets/child.png"
              alt="Child Mode"
              width={280}
              height={320}
              className="dashboard-image"
            />
            <button
              className="button button-primary"
              onClick={switchToChildMode} // Redirect to child dashboard
            >
              Enter Child Mode
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
