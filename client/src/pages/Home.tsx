import { Link } from 'react-router-dom';

const styles = {
  container: {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '16px',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    background: 'linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 100%)',
    borderRadius: '16px',
    padding: '32px 24px',
    textAlign: 'center' as const,
    marginTop: '40px',
  },
  logoEmoji: {
    fontSize: '3rem',
    marginBottom: '8px',
  },
  title: {
    color: '#0369a1',
    fontSize: '2rem',
    fontWeight: 700,
    marginBottom: '12px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '0.9rem',
    marginBottom: '28px',
    lineHeight: 1.5,
  },
  createButton: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '14px 32px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
  },
};

function Home() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoEmoji}>🌊</div>
        <h1 style={styles.title}>Pomowave</h1>
        <p style={styles.subtitle}>
          Ride the wave of productivity with friends.<br />
          Create a room and start focusing together.
        </p>
        <Link to="/new" style={styles.createButton}>
          🏄 Create Room
        </Link>
      </div>
    </div>
  );
}

export default Home;
