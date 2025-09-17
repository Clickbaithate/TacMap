const HomePage = () => {
 return(
  <div className="w-full h-screen flex items-center justify-center">
    <div className="w-1/2 h-3/4 bg-yellow-200 relative flex flex-col items-center justify-center space-y-8">
      <p className="absolute top-10 left-1/2 text-3xl font-bold italic -ml-[75px]">Create Room</p>
      <div className="flex flex-col items-center justify-center w-1/2 space-y-2">
        <input type="text" placeholder="Enter your name" className="w-full p-2 border-2 rounded-md" />
        <div className="flex items-center justify-center w-full space-x-1">
          <div className="w-full p-2 border-2 rounded-md">Generate Room Code</div>
          <div className="p-2 bg-blue-500 text-white rounded-md">Generate</div>
          <div className="py-2 px-3 border-2 border-red-500 rounded-md">Copy</div>
        </div>
      </div>
      <button className="p-3 w-1/2 rounded-md bg-blue-500 text-white">Generate Room</button>
    </div>
    <div className="w-1/2 h-3/4 bg-red-200 relative flex flex-col items-center justify-center space-y-8">
      <p className="absolute top-10 left-1/2 text-3xl font-bold italic -ml-[75px]">Join Room</p>
      <div className="flex flex-col w-full items-center justify-center space-y-3">
        <input type="text" placeholder="Enter your name" className="p-2 border-2 w-1/2 rounded-md" />
        <input type="text" placeholder="Enter your room code" className="p-2 border-2 w-1/2 rounded-md" />
      </div>
      <button className="w-1/2 p-3 border-2 rounded-md">Join Room</button>
    </div>
  </div>
 );
}

export default HomePage;