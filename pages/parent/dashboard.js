// pages/parent/dashboard.js
import Layout from '../../components/Layout';
import Link from 'next/link';

export default function ParentDashboard() {
  return (
    <Layout>
      <div className="container">
        <h1>Parent Dashboard</h1>
        <p>Welcome, Parent!</p>
        <div className="actions">
          <Link href="/parent/create-story"><a className="btn">Create New Story</a></Link>
          <Link href="/parent/my-stories"><a className="btn">My Stories</a></Link>
        </div>
      </div>
      <style jsx>{`
        .container {
          padding: 20px;
        }
        .actions {
          margin-top: 20px;
        }
        .btn {
          display: inline-block;
          margin-right: 10px;
          padding: 10px 15px;
          background-color: #4B0082;
          color: #fff;
          text-decoration: none;
          border-radius: 5px;
        }
      `}</style>
    </Layout>
  );
}
