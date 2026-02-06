import { useState, useEffect } from 'react';
import Avatar from './Avatar';

type User = {
  id: string;
  nickname: string;
  emoji: string;
  isHost: boolean;
};

export type FloatingEmoji = {
  id: number;
  emoji: string;
  left: number;
  animationDuration: number;
};

type CelebrationSceneProps = {
  users: User[];
  participantIds: string[];
  durationMinutes: number;
  onStartTimer: () => void;
  isStarting: boolean;
  onReactionClick: (emoji: string) => void;
  floatingEmojis: FloatingEmoji[];
  isParticipant: boolean;
  onDismiss: () => void;
  workDeclarations?: Record<string, string>;
};

const REACTION_EMOJIS = ['🎉', '🔥', '💪', '🌊', '🏄', '⭐'];

const CELEBRATION_DURATION_MS = 15000;

const styles = {
  container: {
    background: 'linear-gradient(180deg, #1e3a5f 0%, #f59e0b 40%, #f97316 70%, #F4D03F 100%)',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'relative' as const,
    overflow: 'hidden',
    minHeight: '320px',
  },
  title: {
    textAlign: 'center' as const,
    color: 'white',
    fontSize: '1.75rem',
    fontWeight: 700,
    textShadow: '0 2px 10px rgba(0,0,0,0.3)',
    zIndex: 2,
    marginBottom: '4px',
  },
  stats: {
    textAlign: 'center' as const,
    color: 'rgba(255,255,255,0.9)',
    fontSize: '0.875rem',
    zIndex: 2,
    marginBottom: '16px',
  },
  participantsArea: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    flexWrap: 'wrap' as const,
    padding: '10px',
    zIndex: 2,
    marginBottom: '16px',
  },
  surferWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    animation: 'celebrateBounce 0.6s ease-in-out infinite alternate',
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
  reactionsSection: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    flexWrap: 'wrap' as const,
    zIndex: 2,
    marginBottom: '12px',
  },
  reactionButton: {
    background: 'rgba(255,255,255,0.2)',
    border: '2px solid rgba(255,255,255,0.4)',
    borderRadius: '12px',
    padding: '8px 12px',
    fontSize: '1.25rem',
    cursor: 'pointer',
    transition: 'transform 0.15s, background 0.15s',
  },
  floatingEmoji: {
    position: 'absolute' as const,
    fontSize: '1.5rem',
    pointerEvents: 'none' as const,
    zIndex: 5,
    animation: 'floatUp 2s ease-out forwards',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '8px',
    zIndex: 2,
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
  progressBar: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    height: '4px',
    background: 'rgba(255,255,255,0.5)',
    borderRadius: '0 0 16px 16px',
    transition: 'width 1s linear',
    zIndex: 3,
  },
  sparkle: {
    position: 'absolute' as const,
    color: 'white',
    opacity: 0.6,
    fontSize: '1rem',
    zIndex: 1,
  },
  workLabel: {
    fontSize: '0.625rem',
    color: 'rgba(255,255,255,0.8)',
    marginTop: '2px',
    maxWidth: '80px',
    textAlign: 'center' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
};

function CelebrationScene({
  users,
  participantIds,
  durationMinutes,
  onStartTimer,
  isStarting,
  onReactionClick,
  floatingEmojis,
  isParticipant,
  onDismiss,
  workDeclarations = {},
}: CelebrationSceneProps) {
  const [progress, setProgress] = useState(0);

  const participants = users.filter(u => participantIds.includes(u.id));

  // Auto-dismiss progress timer
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / CELEBRATION_DURATION_MS) * 100);
      setProgress(pct);
      if (elapsed >= CELEBRATION_DURATION_MS) {
        clearInterval(interval);
        onDismiss();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [onDismiss]);

  return (
    <div style={styles.container}>
      {/* Decorative sparkles */}
      <div style={{ ...styles.sparkle, top: '12px', left: '10%' }}>✨</div>
      <div style={{ ...styles.sparkle, top: '24px', right: '12%' }}>✨</div>
      <div style={{ ...styles.sparkle, top: '60px', left: '25%' }}>🎊</div>
      <div style={{ ...styles.sparkle, top: '40px', right: '25%' }}>🎊</div>

      {/* Floating reaction emojis */}
      {floatingEmojis.map((fe) => (
        <div
          key={fe.id}
          style={{
            ...styles.floatingEmoji,
            left: `${fe.left}%`,
            bottom: '30%',
            animationDuration: `${fe.animationDuration}s`,
          }}
        >
          {fe.emoji}
        </div>
      ))}

      <div style={styles.title}>Wave Caught! 🏄</div>
      <div style={styles.stats}>
        {durationMinutes} min &middot; {participants.length} surfer{participants.length !== 1 ? 's' : ''}
      </div>

      {/* Participant lineup */}
      <div style={styles.participantsArea}>
        {participants.map((user, index) => (
          <div
            key={user.id}
            style={{
              ...styles.surferWrapper,
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <div style={styles.avatarOnBoard}>
              <Avatar nickname={user.nickname} emoji={user.emoji} />
            </div>
            <div style={styles.surfboard}></div>
            {workDeclarations[user.id] && (
              <div style={styles.workLabel} title={workDeclarations[user.id]}>
                {workDeclarations[user.id]}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Emoji reaction buttons - only for participants */}
      {isParticipant && (
        <div style={styles.reactionsSection}>
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              style={styles.reactionButton}
              onClick={() => onReactionClick(emoji)}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.transform = 'scale(1.2)';
                (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.35)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.transform = 'scale(1)';
                (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.2)';
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Start next wave button */}
      <div style={styles.buttonContainer}>
        <button
          style={{
            ...styles.startButton,
            opacity: isStarting ? 0.7 : 1,
          }}
          onClick={onStartTimer}
          disabled={isStarting}
        >
          {isStarting ? 'Starting...' : '🏄 Start Next Wave'}
        </button>
      </div>

      {/* Auto-dismiss progress bar */}
      <div style={{ ...styles.progressBar, width: `${progress}%` }} />

      <style>{`
        @keyframes celebrateBounce {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-6px); }
        }
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-150px) scale(1.5);
          }
        }
      `}</style>
    </div>
  );
}

export default CelebrationScene;
