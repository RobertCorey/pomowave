import { Link } from 'react-router-dom';

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #87CEEB 0%, #87CEEB 55%, #60a5fa 55%, #3b82f6 60%, #F4D03F 60%, #F4D03F 80%, #C4A35A 80%)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
    overflow: 'hidden',
    padding: '20px',
  },
  sun: {
    position: 'absolute' as const,
    top: '40px',
    right: '60px',
    fontSize: '4rem',
    filter: 'drop-shadow(0 0 20px rgba(255, 200, 50, 0.5))',
  },
  cloud1: {
    position: 'absolute' as const,
    top: '60px',
    left: '10%',
    fontSize: '2.5rem',
    opacity: 0.9,
  },
  cloud2: {
    position: 'absolute' as const,
    top: '100px',
    left: '25%',
    fontSize: '2rem',
    opacity: 0.7,
  },
  cloud3: {
    position: 'absolute' as const,
    top: '80px',
    right: '25%',
    fontSize: '1.8rem',
    opacity: 0.8,
  },
  waveFoam: {
    position: 'absolute' as const,
    top: '53%',
    left: '-5%',
    right: '-5%',
    height: '30px',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)',
    borderRadius: '50%',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '24px',
    padding: '48px 40px',
    boxShadow: '0 8px 32px rgba(30, 58, 95, 0.15)',
    textAlign: 'center' as const,
    zIndex: 10,
    maxWidth: '400px',
    width: '100%',
  },
  logoEmoji: {
    fontSize: '3.5rem',
    marginBottom: '8px',
  },
  title: {
    color: '#1e3a5f',
    fontSize: '2.5rem',
    fontWeight: 700,
    marginBottom: '12px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '1rem',
    marginBottom: '32px',
    lineHeight: 1.5,
  },
  createButton: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    padding: '16px 40px',
    fontSize: '1.1rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    textDecoration: 'none',
  },
  beachItems: {
    position: 'absolute' as const,
    bottom: '8%',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '60px',
    zIndex: 5,
  },
  umbrella: {
    fontSize: '2.5rem',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
  },
  towelWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '4px',
  },
  towel: {
    width: '60px',
    height: '10px',
    background: 'linear-gradient(90deg, #e74c3c 0%, #e74c3c 33%, #fff 33%, #fff 66%, #3498db 66%)',
    borderRadius: '3px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  surfboardLeft: {
    position: 'absolute' as const,
    bottom: '12%',
    left: '8%',
    width: '80px',
    height: '16px',
    background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)',
    borderRadius: '16px',
    transform: 'rotate(-15deg)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  surfboardRight: {
    position: 'absolute' as const,
    bottom: '15%',
    right: '10%',
    width: '70px',
    height: '14px',
    background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
    borderRadius: '14px',
    transform: 'rotate(20deg)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
};

function Home() {
  return (
    <div style={styles.container}>
      {/* Sky elements */}
      <div style={styles.sun}>☀️</div>
      <div style={styles.cloud1}>☁️</div>
      <div style={styles.cloud2}>☁️</div>
      <div style={styles.cloud3}>☁️</div>

      {/* Wave foam */}
      <div style={styles.waveFoam}></div>

      {/* Main card */}
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

      {/* Beach decorations */}
      <div style={styles.beachItems}>
        <div style={styles.umbrella}>⛱️</div>
        <div style={styles.towelWrapper}>
          <div style={styles.towel}></div>
        </div>
        <div style={styles.umbrella}>⛱️</div>
      </div>
      <div style={styles.surfboardLeft}></div>
      <div style={styles.surfboardRight}></div>
    </div>
  );
}

export default Home;
