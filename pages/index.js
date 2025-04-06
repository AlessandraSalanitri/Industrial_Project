import Layout from '../components/Layout';
import Image from 'next/image';
import { useUser } from '../context/UserContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Link from 'next/link';
import '../styles/home_page.css';

export default function Home() {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (user.role === 'parent') {
        router.push('/parent/dashboard');
      } else if (user.role === 'child') {
        router.push('/child/dashboard');
      }
    }
  }, [user, router]);



  return (
    <Layout>
      <div className="container">
      <div className="home-container">
        {/* Image on the left */}
        <div className="image-container">
          <Image src="/assets/home_img.png" alt="Family reading" width={500} height={400} />
        </div>

        {/* Text content on the right */}
        <div className="home-content">
          <h2>AI Bedtime Story Telling</h2>
          <p>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
            Lorem Ipsum has been the industry standard dummy text ever since the 1500s.
          </p>
          <p>
            It has survived not only five centuries, but also the leap into electronic typesetting, 
            remaining essentially unchanged.
          </p>
          <div className="buttons">
          <Link href="/login" legacyBehavior>
            <a className="button button-primary">LOGIN</a>
          </Link>

          <Link href="/signup" legacyBehavior>
            <a className="button button-secondary">SIGN UP</a>
          </Link>
          </div>
        </div>
        </div>
      </div>
    </Layout>
  );
}
