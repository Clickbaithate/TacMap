import { useEffect } from "react";
import bgImg from "../assets/background.jpg";

const HomePage = () => {

  useEffect(() => {
    
  }, [])

  return(
    <div 
      className="w-full h-full flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:px-12 md:space-x-6 font-lilita" 
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      {/* Create Room */}
      <div className="w-3/4 md:w-2/5 h-2/5 flex flex-col items-center justify-evenly rounded-xl bg-white/95">
        {/* Title */}
        <p className="text-2xl md:text-4xl text-blue-400">Create Room</p>
        {/* Inputs */}
        <div className="w-full flex flex-col items-center justify-center space-y-2">
          <input type="text" placeholder="Junko SSG" className="w-[90%] p-2 border-2 rounded-md text-center italic bg-white" />
          <div className="w-[90%] flex items-center justify-center space-x-1">
            <div className="w-full p-2 rounded-md text-sm text-center truncate bg-gray-300">Generate Code</div>
            <button className="p-2 rounded-md text-sm cursor-pointer text-white bg-cyan-500 hover:bg-cyan-400">Generate</button>
            <button className="p-2 rounded-md text-sm border-2 cursor-pointer text-red-500 border-red-500 hover:bg-red-500 hover:text-white">Copy</button>
          </div>
        </div>
        {/* Button */}
        <button className="w-[90%] p-3 rounded-md cursor-pointer text-white bg-yellow-500 hover:bg-yellow-400">Generate Room</button>
      </div>

      {/* Join Room */}
      <div className="w-3/4 md:w-2/5 h-2/5 flex flex-col items-center justify-evenly rounded-xl bg-white/95">
        {/* Title */}
        <p className="text-2xl md:text-4xl text-blue-400">Join Room</p>
        {/* Inputs */}
        <div className="w-full flex flex-col items-center justify-center space-y-2">
          <input type="text" placeholder="FaZe Blaziken" className="w-[90%] p-2 border-2 rounded-md text-center italic bg-white" />
          <input type="text" placeholder="0187d-cf1b-7cc2-82f0-9b" className="w-[90%] p-2 border-2 rounded-md text-center italic bg-white" />
        </div>
        {/* Button */}
        <button className="w-[90%] p-3 rounded-md cursor-pointer text-white bg-purple-500 hover:bg-purple-400">Join Room</button>
      </div>
    </div>
  );

}

export default HomePage;