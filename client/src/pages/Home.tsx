import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-container">
      <h1>Pomowave</h1>
      <p>Create a new room to get started or join an existing room.</p>
      <div className="buttons">
        <Link to="/new">
          <button className="create-room-btn">Create Room</button>
        </Link>
      </div>
    </div>
  );
}

export default Home;