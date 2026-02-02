import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { createRoom } from '../api';

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
  header: {
    marginBottom: '16px',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '0.875rem',
  },
  card: {
    background: 'linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 100%)',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'center' as const,
  },
  logoEmoji: {
    fontSize: '3rem',
    marginBottom: '8px',
  },
  title: {
    color: '#0369a1',
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: '8px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '0.9rem',
    marginBottom: '24px',
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
      <div style={styles.header}>
        <Link to="/" style={styles.backLink}>
          ← Back to home
        </Link>
      </div>

      <div style={styles.card}>
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
    </div>
  );
}

export default NewRoom;
