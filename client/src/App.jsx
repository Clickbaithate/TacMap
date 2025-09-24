import { Route, Routes } from "react-router-dom";
import io from "socket.io-client";
import HomePage from "./pages/HomePage";
import RoomPage from "./pages/RoomPage";
import { useEffect, useState } from "react";

const server = "http://localhost:5000";
const connectionOptions = {
  "force new connection": true,
  reconnectionAttempts: "Infinity",
  timeout: 10000,
  transports: ["websocket"]
};

const socket = io(server, connectionOptions);

const App = () => {

  const [user, setUser] = useState(null);

  useEffect(() => {
    socket.on("userIsJoined", (data) => {
      if (data.success) console.log("User Has Joined!");
      else console.log("User Error!");
    });
  }, []);

  return(
    <div className="w-full h-screen flex">
      <Routes>
        <Route path="/" element={<HomePage socket={socket} setUser={setUser} />} />
        <Route path="/:roomId" element={<RoomPage/>} />
      </Routes>
    </div>
  );
}

export default App;