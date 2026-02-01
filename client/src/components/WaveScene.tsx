import Avatar from './Avatar';

type User = {
  id: string;
  nickname: string;
  emoji: string;
  isHost: boolean;
};

type WaveSceneProps = {
  users: User[];
  participantIds: string[];
  timeRemaining: number;
  startedByName: string;
};

const styles = {
  container: {
    background: 'linear-gradient(180deg, #1e3a5f 0%, #2563eb 40%, #3b82f6 70%, #60a5fa 100%)',
    borderRadius: '16px',
    padding: '20px',
    paddingBottom: '16px',
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
  waveArea: {
    position: 'relative' as const,
    marginTop: '16px',
    minHeight: '140px',
  },
  wave: {
    position: 'absolute' as const,
    bottom: 0,
    left: '-10%',
    right: '-10%',
    height: '100px',
    background: 'linear-gradient(180deg, rgba(96, 165, 250, 0.8) 0%, rgba(37, 99, 235, 0.9) 50%, #1e40af 100%)',
    borderRadius: '50% 50% 0 0',
    transform: 'scaleX(1.2)',
  },
  waveFoam: {
    position: 'absolute' as const,
    bottom: '80px',
    left: '-5%',
    right: '-5%',
    height: '25px',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 100%)',
    borderRadius: '50%',
  },
  surfers: {
    position: 'absolute' as const,
    bottom: '60px',
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
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
    width: '36px',
    height: '8px',
    background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)',
    borderRadius: '8px',
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
  beachSection: {
    marginTop: '12px',
    background: 'linear-gradient(180deg, #F4D03F 0%, #D4A437 100%)',
    borderRadius: '12px',
    padding: '10px 12px',
  },
  beachLabel: {
    fontSize: '0.625rem',
    color: '#92400e',
    textAlign: 'center' as const,
    marginBottom: '6px',
    fontWeight: 500,
  },
  beachGoers: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    flexWrap: 'wrap' as const,
  },
  beachGoerWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  beachTowel: {
    width: '28px',
    height: '4px',
    background: 'linear-gradient(90deg, #e74c3c 0%, #e74c3c 33%, #fff 33%, #fff 66%, #3498db 66%)',
    borderRadius: '2px',
    marginTop: '2px',
  },
};

function WaveScene({ users, participantIds, timeRemaining, startedByName }: WaveSceneProps) {
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Separate users into surfers (participants) and beach-goers (late joiners)
  const surfers = users.filter(u => participantIds.includes(u.id));
  const beachGoers = users.filter(u => !participantIds.includes(u.id));

  return (
    <div style={styles.container}>
      {/* Sparkles for atmosphere */}
      <div style={{ ...styles.sparkle, top: '16px', left: '12%' }}>✨</div>
      <div style={{ ...styles.sparkle, top: '32px', right: '15%' }}>✨</div>

      <div style={styles.timerDisplay}>{formatTime(timeRemaining)}</div>
      <div style={styles.subtitle}>Surfing the pomo wave 🌊</div>
      <div style={{ ...styles.subtitle, fontSize: '0.75rem', marginTop: '2px' }}>
        Started by {startedByName}
      </div>

      <div style={styles.waveArea}>
        <div style={styles.waveFoam}></div>
        <div style={styles.wave}></div>

        <div style={styles.surfers}>
          {surfers.map((user, index) => (
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

      {/* Beach section for late joiners */}
      {beachGoers.length > 0 && (
        <div style={styles.beachSection}>
          <div style={styles.beachLabel}>⏳ Waiting for next wave</div>
          <div style={styles.beachGoers}>
            {beachGoers.map((user) => (
              <div key={user.id} style={styles.beachGoerWrapper}>
                <Avatar nickname={user.nickname} emoji={user.emoji} size="small" />
                <div style={styles.beachTowel}></div>
              </div>
            ))}
          </div>
        </div>
      )}

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
