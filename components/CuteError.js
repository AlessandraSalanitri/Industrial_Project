// components/CuteError.js
import Link from 'next/link';

export default function CuteError({ message = "Something went wrong!", showHome = true }) {
  return (
    <div style={{
      backgroundColor: '#d4b4db',
      height: '100vh',
      width: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      textAlign: 'center',
    }}>
      
      {/* Floating image background */}
      <div style={{
        animation: 'float 6s ease-in-out infinite',
        position: 'absolute',
        top: '5%',
        width: '80%',
        maxWidth: '700px',
        zIndex: 1,
      }}>
        <img 
          src="/assets/pagefailed.jpeg" 
          alt="Cute Error Image" 
          style={{ width: '100%', height: 'auto' }}
        />
      </div>

      {/* Message and home button */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        marginTop: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <h1 style={{ 
        fontSize: '2.1rem', 
        marginBottom: '10px',
        color: '#311942',
        fontFamily: "'Poppins', sans-serif",
        background: 'transparent',
        userSelect: 'none',            // optional
        WebkitUserSelect: 'none',      // optional for Safari
        MozUserSelect: 'none',         // optional for Firefox
        }}>
          {message}
        </h1>

        <p style={{
          fontSize: '1.1rem',
          color: '#311942',
          fontFamily: "'Poppins', sans-serif",
          marginBottom: '20px'
        }}>
          Looks like this page floated away with the clouds... Let's find our way home!
        </p>

        {showHome && (
          <Link href="/" passHref>
            <img 
              src="/assets/cloud.png" 
              alt="Go Home"
              style={{
                width: '130px',
                height: 'auto',
                marginTop: '20px',
                cursor: 'pointer',
                animation: 'float 6s ease-in-out infinite'
              }}
            />
          </Link>
        )}
      </div>

      {/* Floating animation */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}
