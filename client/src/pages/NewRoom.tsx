import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { createRoom } from '../api';

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
    padding: '40px',
    boxShadow: '0 8px 32px rgba(30, 58, 95, 0.15)',
    textAlign: 'center' as const,
    zIndex: 10,
    maxWidth: '400px',
    width: '100%',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '0.875rem',
    marginBottom: '20px',
    transition: 'color 0.2s',
  },
  logoEmoji: {
    fontSize: '3rem',
    marginBottom: '8px',
  },
  title: {
    color: '#1e3a5f',
    fontSize: '1.75rem',
    fontWeight: 700,
    marginBottom: '8px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '0.9rem',
    marginBottom: '28px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    textAlign: 'left' as const,
  },
  label: {
    color: '#1e3a5f',
    fontSize: '0.875rem',
    fontWeight: 600,
  },
  input: {
    padding: '14px 16px',
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    background: 'linear-gradient(180deg, #f8fafc 0%, #fff 100%)',
  },
  submitButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    padding: '16px 32px',
    fontSize: '1.1rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    transition: 'transform 0.2s, box-shadow 0.2s, opacity 0.2s',
    marginTop: '8px',
  },
  submitButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  error: {
    background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '0.875rem',
    marginTop: '8px',
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

function NewRoom() {
  const [nickname, setNickname] = useState('');
  const navigate = useNavigate();

  const createRoomMutation = useMutation({
    mutationFn: () => createRoom(nickname),
    onSuccess: (data) => {
      // Save the user ID to localStorage, namespaced by the room ID
      const roomUserMap = JSON.parse(localStorage.getItem('roomUserMap') || '{}');
      roomUserMap[data.room.id] = data.userId;
      localStorage.setItem('roomUserMap', JSON.stringify(roomUserMap));

      // Navigate to the room page
      navigate(`/room/${data.room.id}`);
    },
  });

  const isDisabled = createRoomMutation.isPending || !nickname.trim();

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
        <Link to="/" style={styles.backLink}>
          ← Back to home
        </Link>
        <div style={styles.logoEmoji}>🏄</div>
        <h1 style={styles.title}>Create a Room</h1>
        <p style={styles.subtitle}>
          Set up your space and invite friends to surf together
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
            {createRoomMutation.isPending ? 'Creating...' : '🌊 Create Room'}
          </button>
        </form>

        {createRoomMutation.isError && (
          <div style={styles.error}>
            Error creating room: {(createRoomMutation.error as Error).message}
          </div>
        )}
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

export default NewRoom;
