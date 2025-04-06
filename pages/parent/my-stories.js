// pages/parent/my-stories.js
import Layout from '../../components/Layout';
import Link from 'next/link';

export default function MyStories() {
  // Dummy data for stories
  const stories = [
    { id: 1, title: 'The Magical Forest' },
    { id: 2, title: 'Journey to the Stars' }
  ];

  return (
    <Layout>
      <div className="container">
        <h1>My Stories</h1>
        <ul>
          {stories.map((story) => (
            <li key={story.id}>
              {story.title} - 
              <Link href={`/parent/create-story?id=${story.id}`}><a>Edit</a></Link>
            </li>
          ))}
        </ul>
      </div>
      <style jsx>{`
        .container {
          padding: 20px;
        }
        ul {
          list-style: none;
          padding: 0;
        }
        li {
          margin: 10px 0;
        }
        a {
          margin-left: 10px;
          color: #4B0082;
          text-decoration: underline;
        }
      `}</style>
    </Layout>
  );
}
