import Layout from '../components/Layout';
import Image from 'next/image';
import '../styles/about.css';

export default function About() {
  return (
    <Layout>
      <div className="about-container">
        <h1>About Us</h1>
        <div className="about-card">
        <p>
          At <strong>Studioo</strong>, we believe bedtime should be a moment of connection, creativity, and calm.
          Our journey began with a simple question:
          <em> “What if stories could be crafted in seconds, just for your child?”</em>
        </p>

        <p>
          Born from passion and powered by AI, our app helps parents create unique, magical stories tailored
          to each child’s age, interests, and imagination — no writing skills or time crunch required.
        </p>

        <p>
          Whether you're tucking in a toddler or entertaining a curious grade-schooler,
          we make it possible to <strong>listen or read along</strong>, laugh, bond, and dream together.
        </p>

        <p>
          <strong>Our team</strong> — a group of developers, designers, and storytellers — came together to build
          this project with heart. We're students, dreamers, and believers in better bedtime.
        </p>

        <p className="closing-line">And we’re just getting started 🚀</p>
      </div>

      {/* VIDEO COMERCIAL */}
      <div className="about-video">
        <iframe
          width="100%"
          height="510"
          src="https://www.youtube.com/embed/TxQwuLELm2E"
          title="Studioo Promo Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      {/* IMAGE */}
        <div className="about-image">
          <Image
            src="/assets/about_img.png"
            alt="AI story concept"
            width={900}
            height={400}
          />
        </div>



      </div>
    </Layout>
  );
}
