import Avatar from './Avatar';

type User = {
  id: string;
  nickname: string;
  emoji: string;
  isHost: boolean;
};

type WaveSceneProps = {
  users: User[];
  timeRemaining: number;
  startedByName: string;
};

const styles = {
  container: {
    background: 'linear-gradient(180deg, #1e3a5f 0%, #2563eb 40%, #3b82f6 70%, #60a5fa 100%)',
    borderRadius: '16px',
    padding: '20px',
    minHeight: '280px',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'relative' as const,
    overflow: 'hidden',
  },
  timerDisplay: {
    textAlign: 'center' as const,
    color: 'white',
    fontSize: '3rem',
    fontWeight: 700,
    fontFamily: 'monospace',
    textShadow: '0 2px 10px rgba(0,0,0,0.3)',
    zIndex: 2,
  },
  subtitle: {
    textAlign: 'center' as const,
    color: 'rgba(255,255,255,0.8)',
    fontSize: '0.875rem',
    marginTop: '4px',
    zIndex: 2,
  },
  waveContainer: {
    flex: 1,
    position: 'relative' as const,
    marginTop: '20px',
  },
  wave: {
    position: 'absolute' as const,
    bottom: 0,
    left: '-10%',
    right: '-10%',
    height: '120px',
    background: 'linear-gradient(180deg, rgba(96, 165, 250, 0.8) 0%, rgba(37, 99, 235, 0.9) 50%, #1e40af 100%)',
    borderRadius: '50% 50% 0 0',
    transform: 'scaleX(1.2)',
  },
  waveFoam: {
    position: 'absolute' as const,
    bottom: '100px',
    left: '-5%',
    right: '-5%',
    height: '30px',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)',
    borderRadius: '50%',
  },
  surfers: {
    position: 'absolute' as const,
    bottom: '80px',
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    flexWrap: 'wrap' as const,
    padding: '0 10px',
    zIndex: 3,
  },
  surferWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    animation: 'bob 2s ease-in-out infinite',
  },
  surfboard: {
    width: '40px',
    height: '10px',
    background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)',
    borderRadius: '10px',
    marginTop: '2px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  avatarOnBoard: {
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
  },
  sparkle: {
    position: 'absolute' as const,
    color: 'white',
    opacity: 0.6,
    fontSize: '1rem',
  },
};

function WaveScene({ users, timeRemaining, startedByName }: WaveSceneProps) {
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div style={styles.container}>
      {/* Sparkles for atmosphere */}
      <div style={{ ...styles.sparkle, top: '20px', left: '15%' }}>✨</div>
      <div style={{ ...styles.sparkle, top: '40px', right: '20%' }}>✨</div>
      <div style={{ ...styles.sparkle, top: '60px', left: '25%' }}>✨</div>

      <div style={styles.timerDisplay}>{formatTime(timeRemaining)}</div>
      <div style={styles.subtitle}>Surfing the pomo wave 🌊</div>
      <div style={{ ...styles.subtitle, fontSize: '0.75rem', marginTop: '2px' }}>
        Started by {startedByName}
      </div>

      <div style={styles.waveContainer}>
        <div style={styles.waveFoam}></div>
        <div style={styles.wave}></div>

        <div style={styles.surfers}>
          {users.map((user, index) => (
            <div
              key={user.id}
              style={{
                ...styles.surferWrapper,
                animationDelay: `${index * 0.3}s`,
              }}
            >
              <div style={styles.avatarOnBoard}>
                <Avatar nickname={user.nickname} emoji={user.emoji} />
              </div>
              <div style={styles.surfboard}></div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS animation for bobbing */}
      <style>{`
        @keyframes bob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}

export default WaveScene;
