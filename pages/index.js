import Layout from '../components/Layout';
import Image from 'next/image';
import { useUser } from '../context/UserContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Link from 'next/link';
import '../styles/home_page.css';
import { PaintBrush, BookOpen, Clock, MoonStars, Sparkle, Heart, StarAndCrescent   } from 'phosphor-react';


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
        <h1 className="hero-heading">AI Bedtime Story Telling</h1>


        <p className="tagline">
        <MoonStars size={20} weight="fill" color="#4B0082" style={{ marginRight: '6px' }} />
        Bedtime just got easier <br></br> and more magical.
        {/* <Sparkle size={20} weight="fill" color="#4B0082" style={{ marginLeft: '6px' }} /> */}
        </p>


        <p>
          Turn your child’s imagination into a <strong>custom bedtime story</strong> in seconds. Whether you’re short on time or want something truly special, our AI creates heartwarming tales based on your child’s <strong>age, interests, and favorite themes</strong>.
        </p>

        <ul className="features">
        <li>
          <PaintBrush size={20} weight="fill" style={{ marginRight: '8px', color: '#4B0082' }} />
          <strong>Fully customizable</strong>
        </li>
        <li>
          <BookOpen size={20} weight="fill" style={{ marginRight: '8px', color: '#4B0082' }} />
          <strong>Read aloud</strong> or let the app narrate
        </li>
        <li>
          <Clock size={20} weight="fill" style={{ marginRight: '8px', color: '#4B0082' }} />
          <strong>Save time</strong>, skip the stress — enjoy more snuggles
        </li>
        </ul>

        <p className="closing">
        <span>Because every child deserves a story</span><br />
        <span>that’s just for them</span>
        <Heart size={20} weight="fill" color="#c4c4c4" style={{ marginLeft: '8px' }} />
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
