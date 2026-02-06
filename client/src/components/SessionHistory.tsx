type User = {
  id: string;
  nickname: string;
  emoji: string;
  isHost: boolean;
};

type PomoSession = {
  id: string;
  startedAt: number;
  startedBy: string;
  participants: string[];
  durationMinutes: number;
  workDeclarations?: Record<string, string>;
};

type SessionHistoryProps = {
  sessions: PomoSession[];
  users: User[];
  showWorkDeclarations?: boolean;
};

const styles = {
  container: {
    marginTop: '20px',
  },
  title: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#334155',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  emptyState: {
    color: '#94a3b8',
    fontSize: '0.875rem',
    textAlign: 'center' as const,
    padding: '20px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  session: {
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    borderRadius: '12px',
    padding: '12px 14px',
    border: '1px solid #bae6fd',
  },
  sessionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  sessionTime: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
  sessionDuration: {
    fontSize: '0.75rem',
    color: '#0369a1',
    fontWeight: 500,
  },
  participants: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '6px',
    alignItems: 'center',
  },
  participant: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'white',
    padding: '4px 8px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    color: '#334155',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  participantEmoji: {
    fontSize: '0.875rem',
  },
  starterBadge: {
    fontSize: '0.625rem',
    color: '#f59e0b',
    marginLeft: '2px',
  },
  waveCount: {
    fontSize: '0.875rem',
    color: '#0ea5e9',
  },
  workText: {
    fontSize: '0.625rem',
    color: '#64748b',
    marginLeft: '2px',
    fontStyle: 'italic' as const,
  },
};

function SessionHistory({ sessions, users, showWorkDeclarations }: SessionHistoryProps) {
  const getUserById = (id: string) => users.find(u => u.id === id);

  const formatSessionTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Show most recent sessions first, limit to 5
  const recentSessions = [...sessions].reverse().slice(0, 5);

  return (
    <div style={styles.container}>
      <div style={styles.title}>
        <span style={styles.waveCount}>🌊 {sessions.length}</span>
        <span>Waves Caught</span>
      </div>

      {recentSessions.length === 0 ? (
        <div style={styles.emptyState}>
          No pomos yet! Start one to catch your first wave 🏄
        </div>
      ) : (
        <div style={styles.list}>
          {recentSessions.map((session) => {
            return (
              <div key={session.id} style={styles.session}>
                <div style={styles.sessionHeader}>
                  <span style={styles.sessionTime}>
                    {formatSessionTime(session.startedAt)}
                  </span>
                  <span style={styles.sessionDuration}>
                    {session.durationMinutes} min
                  </span>
                </div>
                <div style={styles.participants}>
                  {session.participants.map((participantId) => {
                    const user = getUserById(participantId);
                    const isStarter = participantId === session.startedBy;
                    const work = showWorkDeclarations && session.workDeclarations?.[participantId];
                    return (
                      <div key={participantId} style={styles.participant}>
                        <span style={styles.participantEmoji}>
                          {user?.emoji || '🐚'}
                        </span>
                        <span>{user?.nickname || 'Unknown'}</span>
                        {isStarter && <span style={styles.starterBadge}>⭐</span>}
                        {work && <span style={styles.workText}>- {work}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SessionHistory;
