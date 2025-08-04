import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlusCircle } from "react-icons/fa";

function HomePage() {

  const navigate = useNavigate();

  const [toggle, setToggle] = useState(false);
  const [roomId, setRoomId] = useState("");

  const handleId = (e) => setRoomId(e.target.value);
  const handleCreate = () => navigate("/create");
  const handleJoin = () => {
    navigate(`/join/${roomId}`);
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-cover" style={{ backgroundImage: 'url(/src/assets/background.png)' }}>
      <div className="w-full flex flex-col items-center space-y-8">
        <div className="w-1/4 flex flex-col items-center space-y-6 p-8 shadow-md rounded-3xl shadow-purple-700 bg-purple-600">
          <div className='flex flex-col items-center'>
            <p className='font-bold text-4xl'>Join by ID</p>
            <p className='italic'>Enter the Room ID to join your friends.</p>
          </div>
          <div className='flex flex-col items-center space-y-3'>
            <p className='font-bold text-3xl'>Room ID</p>
            <div className='space-y-2'>
              <input className='w-full p-2 rounded-full text-center italic text-black bg-white' placeholder='Enter ID...' value={roomId} onChange={handleId}/>
              <div className='w-full p-2 text-center rounded-full font-bold cursor-pointer bg-purple-900' onClick={() => {(roomId === "") ? null : handleJoin()}}>JOIN</div>
            </div>
          </div>
        </div>

        <p className='text-3xl font-bold'>OR...</p>

        <div className="w-1/4 flex flex-col items-center space-y-6 p-8 shadow-md rounded-3xl shadow-purple-700 bg-purple-600">
          <div className='flex flex-col items-center'>
            <p className='font-bold text-4xl'>Create a Room</p>
            <p className='italic text-center'>Start a room and invite your friends to join you in mapping out strategies collaboratively!</p>
          </div>
          <div className='w-full flex flex-col items-center space-y-3'>
            <p className='font-bold text-3xl'>Room Name</p>
            <div className='w-full space-y-4'>
              <input className='w-full p-2 rounded-full text-center italic text-black bg-white' placeholder='Enter Room Name...' />
              <div className='flex space-x-1'>
                <div className='w-3/4 flex items-center justify-center space-x-2 p-2 text-center rounded-full font-bold bg-purple-900' onClick={() => setToggle(!toggle)}>
                  <p>LOCK MAP</p>
                  <div className={`w-12 h-6 flex items-center rounded-full bg-white`}>
                    <div className={`w-5 h-5 rounded-full ${toggle ? "translate-x-6 bg-purple-500" : "translate-x-1 bg-gray-500"} transform transition-transform duration-300`}/>
                  </div>
                </div> 
                <div className='w-1/4 p-2 flex items-center justify-center rounded-full font-bold bg-purple-900'>
                  {/* <FaPlusCircle className='w-5 h-5'/> */}
                  CREATE
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
