import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { createRoom, validateRooms, RoomDetails } from '../api';

const styles = {
  container: {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '16px',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    gap: '16px',
  },
  card: {
    background: 'linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 100%)',
    borderRadius: '16px',
    padding: '32px 24px',
    textAlign: 'center' as const,
    marginTop: '24px',
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
    marginBottom: '24px',
    lineHeight: 1.5,
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    textAlign: 'left' as const,
  },
  label: {
    color: '#0369a1',
    fontSize: '0.875rem',
    fontWeight: 600,
  },
  input: {
    padding: '12px 16px',
    borderRadius: '12px',
    border: '2px solid #bae6fd',
    fontSize: '1rem',
    outline: 'none',
  },
  submitButton: {
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '14px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '8px',
  },
  submitButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  error: {
    color: '#dc2626',
    fontSize: '0.875rem',
    marginTop: '8px',
  },
  roomsCard: {
    background: 'linear-gradient(180deg, #fef3c7 0%, #fde68a 100%)',
    borderRadius: '16px',
    padding: '24px',
  },
  roomsTitle: {
    color: '#92400e',
    fontSize: '1.25rem',
    fontWeight: 700,
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  roomsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  roomLink: {
    display: 'block',
    background: 'white',
    borderRadius: '10px',
    padding: '12px 16px',
    textDecoration: 'none',
    color: '#92400e',
    fontWeight: 500,
    fontSize: '0.95rem',
    transition: 'transform 0.1s ease',
  },
  roomCode: {
    fontFamily: 'monospace',
    background: '#fef3c7',
    padding: '2px 8px',
    borderRadius: '4px',
    marginLeft: '8px',
  },
  emptyRooms: {
    color: '#92400e',
    fontSize: '0.9rem',
    opacity: 0.7,
  },
  roomInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  roomMain: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    flex: 1,
  },
  roomDetails: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.8rem',
    color: '#78350f',
    marginTop: '4px',
  },
  roomUsers: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  roomWaves: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#0369a1',
    fontWeight: 600,
  },
  loadingRooms: {
    color: '#92400e',
    fontSize: '0.9rem',
    textAlign: 'center' as const,
    padding: '12px',
  },
};

function Home() {
  const [nickname, setNickname] = useState('');
  const [roomIds, setRoomIds] = useState<string[]>([]);
  const [roomDetails, setRoomDetails] = useState<Record<string, RoomDetails>>({});
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const validateAndPruneRooms = async () => {
      const roomUserMap = JSON.parse(localStorage.getItem('roomUserMap') || '{}');
      const storedRoomIds = Object.keys(roomUserMap);

      if (storedRoomIds.length === 0) {
        setIsLoadingRooms(false);
        return;
      }

      try {
        const response = await validateRooms(storedRoomIds);
        const details = response.roomDetails;

        // Prune non-existent rooms from localStorage
        const validRoomIds: string[] = [];
        for (const roomId of storedRoomIds) {
          if (details[roomId] !== null) {
            validRoomIds.push(roomId);
          } else {
            delete roomUserMap[roomId];
          }
        }

        // Update localStorage if any rooms were pruned
        if (validRoomIds.length !== storedRoomIds.length) {
          localStorage.setItem('roomUserMap', JSON.stringify(roomUserMap));
        }

        setRoomIds(validRoomIds);
        setRoomDetails(details);
      } catch (error) {
        console.error('Error validating rooms:', error);
        // Fallback to showing all rooms from localStorage if validation fails
        setRoomIds(storedRoomIds);
      } finally {
        setIsLoadingRooms(false);
      }
    };

    validateAndPruneRooms();
  }, []);

  const createRoomMutation = useMutation({
    mutationFn: () => createRoom(nickname),
    onSuccess: (data) => {
      const roomUserMap = JSON.parse(localStorage.getItem('roomUserMap') || '{}');
      roomUserMap[data.room.id] = data.userId;
      localStorage.setItem('roomUserMap', JSON.stringify(roomUserMap));
      navigate(`/room/${data.room.id}`);
    },
  });

  const isDisabled = createRoomMutation.isPending || !nickname.trim();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoEmoji}>🌊</div>
        <h1 style={styles.title}>Pomowave</h1>
        <p style={styles.subtitle}>
          Ride the wave of productivity with friends.<br />
          Create a room and start focusing together.
        </p>

        <form
          style={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            if (nickname.trim()) {
              createRoomMutation.mutate();
            }
          }}
        >
          <div style={styles.formGroup}>
            <label htmlFor="nickname" style={styles.label}>
              Your Nickname
            </label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter your nickname..."
              style={styles.input}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isDisabled}
            style={{
              ...styles.submitButton,
              ...(isDisabled ? styles.submitButtonDisabled : {}),
            }}
          >
            {createRoomMutation.isPending ? 'Creating...' : '🏄 Create Room'}
          </button>
        </form>

        {createRoomMutation.isError && (
          <div style={styles.error}>
            Error creating room: {(createRoomMutation.error as Error).message}
          </div>
        )}
      </div>

      {(isLoadingRooms || roomIds.length > 0) && (
        <div style={styles.roomsCard}>
          <h2 style={styles.roomsTitle}>
            🏠 Your Rooms
          </h2>
          {isLoadingRooms ? (
            <div style={styles.loadingRooms}>Loading rooms...</div>
          ) : (
            <div style={styles.roomsList}>
              {roomIds.map((roomId) => {
                const details = roomDetails[roomId];
                return (
                  <Link
                    key={roomId}
                    to={`/room/${roomId}`}
                    style={styles.roomLink}
                  >
                    <div style={styles.roomInfo}>
                      <div style={styles.roomMain}>
                        <div>
                          Room <span style={styles.roomCode}>{roomId}</span>
                        </div>
                        {details && (
                          <div style={styles.roomDetails}>
                            <div style={styles.roomUsers}>
                              {details.users.slice(0, 3).map((user, idx) => (
                                <span key={idx}>{user.emoji} {user.nickname}{idx < Math.min(details.users.length, 3) - 1 ? ', ' : ''}</span>
                              ))}
                              {details.users.length > 3 && (
                                <span> +{details.users.length - 3} more</span>
                              )}
                            </div>
                            <div style={styles.roomWaves}>
                              🌊 {details.wavesCompleted} wave{details.wavesCompleted !== 1 ? 's' : ''}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Home;
