import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

// API function to flip the coin
const flipCoin = async (): Promise<CoinFace> => {
  const response = await fetch('/api/flip', {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  return response.json();
};

function App() {
  const queryClient = useQueryClient();
  
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
  
  // Mutation for flipping the coin
  const flipMutation = useMutation({
    mutationFn: flipCoin,
    onSuccess: () => {
      // Invalidate and refetch the coin face after successful flip
      queryClient.invalidateQueries({ queryKey: ['coinFace'] });
    },
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
      <button 
        onClick={() => flipMutation.mutate()}
        disabled={flipMutation.isPending}
      >
        {flipMutation.isPending ? 'Flipping...' : 'Flip Coin'}
      </button>
    </div>
  );
}

export default App;
