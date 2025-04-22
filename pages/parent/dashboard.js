import Layout from '../../components/Layout';
import Image from 'next/image';
import Link from 'next/link';
import '../../styles/parent_dashboard.css';

export default function ParentDashboard() {
  // Function to set restricted mode
  const switchToChildMode = () => {
    localStorage.setItem('restrictedMode', 'true');  // Set restricted mode
    window.location.href = '/child/dashboard'; // Redirect to child dashboard
  };

  return (
    <Layout>
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

          {/* Add the button to switch to restricted child mode */}
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
              onClick={switchToChildMode}  // When clicked, enable restricted mode
            >
              Switch to Child Mode
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
