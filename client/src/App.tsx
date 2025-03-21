import { useQuery } from '@tanstack/react-query';

interface CoinFace {
  face: 'heads' | 'tails' | null;
}

// API function for fetching the current face of the coin
const fetchCoinFace = async (): Promise<CoinFace> => {
  const response = await fetch('/api/coin-face');
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  return response.json();
};

function App() {
  // Use React Query to fetch and poll coin face
  const {
    data: coinData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['coinFace'],
    queryFn: fetchCoinFace,
    refetchInterval: 5000, // Poll every 5 seconds
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading coin data: {(error as Error).message}</div>;

  return (
    <div>
      <h1>Coin Flip</h1>
      <div className="coin-display">
        {coinData ? (
          <h2>{coinData.face || 'No face set'}</h2>
        ) : (
          <p>Coin data unavailable</p>
        )}
      </div>
    </div>
  );
}

export default App;
