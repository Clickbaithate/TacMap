import { Link, useNavigate } from 'react-router-dom';

function HomePage() {

  const navigate = useNavigate();

  const handleCreate = () => navigate("/create");
  const handleJoin = () => navigate("/join");

  return (
    <div className="w-full h-screen flex items-center justify-center bg-blue-400">
      <div className="flex space-x-4 p-6">
        <div className="p-4 rounded-2xl font-bold cursor-pointer border-4 border-transparent hover:border-black text-black bg-red-200" onClick={handleCreate}>
          Create Room
        </div>
        <div className="p-4 rounded-2xl font-bold cursor-pointer border-4 border-transparent hover:border-black text-black bg-blue-200" onClick={handleJoin}>
          Join Room
        </div>
      </div>
    </div>
  );
}

export default HomePage;
