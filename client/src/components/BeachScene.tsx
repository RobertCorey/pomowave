import Avatar from './Avatar';

type User = {
  id: string;
  nickname: string;
  emoji: string;
  isHost: boolean;
};

type BeachSceneProps = {
  users: User[];
  onStartTimer: () => void;
  isStarting: boolean;
  timerComplete?: boolean;
};

const styles = {
  container: {
    background: 'linear-gradient(180deg, #87CEEB 0%, #87CEEB 60%, #F4D03F 60%, #F4D03F 75%, #C4A35A 75%)',
    borderRadius: '16px',
    padding: '20px',
    minHeight: '280px',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'relative' as const,
    overflow: 'hidden',
  },
  sun: {
    position: 'absolute' as const,
    top: '15px',
    right: '20px',
    fontSize: '2.5rem',
  },
  cloud: {
    position: 'absolute' as const,
    top: '20px',
    left: '20px',
    fontSize: '1.5rem',
    opacity: 0.8,
  },
  title: {
    textAlign: 'center' as const,
    color: '#1e3a5f',
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: '8px',
    zIndex: 1,
  },
  beachArea: {
    flex: 1,
    display: 'flex',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: '16px',
    padding: '10px',
    paddingBottom: '30px',
  },
  avatarWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  towel: {
    width: '50px',
    height: '8px',
    background: 'linear-gradient(90deg, #e74c3c 0%, #e74c3c 33%, #fff 33%, #fff 66%, #3498db 66%)',
    borderRadius: '2px',
    marginTop: '4px',
  },
  umbrella: {
    fontSize: '1.2rem',
    marginBottom: '-8px',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '10px',
  },
  startButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    padding: '14px 32px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  completeMessage: {
    textAlign: 'center' as const,
    color: '#059669',
    fontWeight: 600,
    marginBottom: '8px',
  },
  wave: {
    position: 'absolute' as const,
    bottom: '70px',
    left: 0,
    right: 0,
    height: '20px',
    background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.3) 0%, transparent 100%)',
  },
};

function BeachScene({ users, onStartTimer, isStarting, timerComplete }: BeachSceneProps) {
  return (
    <div style={styles.container}>
      <div style={styles.sun}>☀️</div>
      <div style={styles.cloud}>☁️</div>
      <div style={styles.wave}></div>

      <div style={styles.title}>Relaxing on the beach...</div>

      <div style={styles.beachArea}>
        {users.map((user, index) => (
          <div key={user.id} style={styles.avatarWrapper}>
            {index % 2 === 0 && <div style={styles.umbrella}>⛱️</div>}
            <Avatar nickname={user.nickname} emoji={user.emoji} />
            <div style={styles.towel}></div>
          </div>
        ))}
      </div>

      <div style={styles.buttonContainer}>
        {timerComplete && (
          <div style={styles.completeMessage}>Pomo complete! Nice work! 🎉</div>
        )}
        <button
          style={{
            ...styles.startButton,
            opacity: isStarting ? 0.7 : 1,
          }}
          onClick={onStartTimer}
          disabled={isStarting}
        >
          {isStarting ? 'Starting...' : '🏄 Start Pomo'}
        </button>
      </div>
    </div>
  );
}

export default BeachScene;
