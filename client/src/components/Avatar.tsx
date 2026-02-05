type AvatarProps = {
  nickname: string;
  emoji: string;
  size?: 'small' | 'medium';
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '4px',
  },
  emojiContainer: {
    fontSize: '2rem',
    lineHeight: 1,
  },
  emojiContainerSmall: {
    fontSize: '1.5rem',
  },
  name: {
    fontSize: '0.75rem',
    fontWeight: 500,
    color: '#334155',
    textAlign: 'center' as const,
    maxWidth: '60px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
};

function Avatar({ nickname, emoji, size = 'medium' }: AvatarProps) {
  const emojiStyle = size === 'small'
    ? { ...styles.emojiContainer, ...styles.emojiContainerSmall }
    : styles.emojiContainer;

  return (
    <div style={styles.container}>
      <div style={emojiStyle}>{emoji}</div>
      <div style={styles.name}>{nickname}</div>
    </div>
  );
}

export default Avatar;
