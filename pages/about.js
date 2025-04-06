import Layout from '../components/Layout';
import Image from 'next/image';
import '../styles/about.css';

export default function About() {
  return (
    <Layout>
      <div className="about-container">
        <h1>About Us</h1>
        <p>
          Lorem Ipsum has been the industry's standard dummy 
          text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type 
          specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, 
          remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets 
          containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker 
          including versions of Lorem Ipsum.
        </p>

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
