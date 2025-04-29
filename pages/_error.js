import Link from 'next/link';

export default function CustomError({ statusCode }) {
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
      color: '#fff'
    }}>
      
      {/* Floating Image */}
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



      {/* Message */}
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
        }}>
        {statusCode ? `Error ${statusCode}` : 'Oops! Something went wrong'}
        </h1>

        <p style={{ 
        fontSize: '1.1rem', 
        marginBottom: '20px',
        color: '#311942',
        fontFamily: "'Poppins', sans-serif",
        }}>
        Looks like this page floated away with the clouds... Let's find our way home!
        </p>


        {/* Clickable cloud image */}
        <Link href="/" passHref>
          <img
            src="/assets/cloud.png" // cloud image as button
            alt="Click to go Home"
            style={{
              width: '130px',
              height: 'auto',
              marginTop: '20px',
              cursor: 'pointer',
              animation: 'float 6s ease-in-out infinite',
            }}
          />
        </Link>
      </div>

      {/* Keyframes Animation */}
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

// Handle error status codes
CustomError.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};
