import { useEffect, useState } from "react";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { firebaseAuth, firestoreDB } from "../../firebase/firebaseConfig";
import Layout from '../../components/Layout';
import Image from 'next/image';
import Link from 'next/link';
import '../../styles/parent_dashboard.css';

export default function ParentDashboard() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      setDarkMode(true);
      document.body.classList.add("dark-mode");
    }
  }, []);

  const handleThemeToggle = (mode) => {
    const isDark = mode === "dark";
    setDarkMode(isDark);
    localStorage.setItem("theme", mode);
    document.body.classList.toggle("dark-mode", isDark);
  };

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

      const simulatedUser = {
        email: simulatedChildEmail,
        role: 'child',
        isSimulated: true,
        userId: `${parentId}-simulated`
      };

      localStorage.setItem('mode', 'child');
      localStorage.setItem('user', JSON.stringify(simulatedUser));

      window.location.href = "/child/dashboard";
    } catch (error) {
      console.error("Error linking simulated child account:", error);
    }
  };

  return (
    <Layout>
      <div className="theme-toggle top-right">
        <button
          className={`toggle-btn ${!darkMode ? 'active' : ''}`}
          onClick={() => handleThemeToggle("light")}
        >
          Light
        </button>
        <button
          className={`toggle-btn ${darkMode ? 'active' : ''}`}
          onClick={() => handleThemeToggle("dark")}
        >
          Dark
        </button>
      </div>

      <div className="admin-dashboard">
        <h1 className="dashboard-title">Admin Dashboard</h1>

        <div className="dashboard-actions">
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
              onClick={switchToChildMode}
            >
              Enter Child Mode
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
