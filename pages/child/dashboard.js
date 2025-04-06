// pages/child/dashboard.js
import Layout from '../../components/Layout';
import StoryList from '../../components/StoryList';
import '../../styles/child_dashboard.css';

export default function ChildDashboard() {
  return (
    <Layout>
      <div className="child-dashboard">
        <StoryList />
      </div>
    </Layout>
  );
}
