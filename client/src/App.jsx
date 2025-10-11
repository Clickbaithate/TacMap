import { Route, Routes } from "react-router-dom";
import io from "socket.io-client";
import HomePage from "./pages/HomePage";
import RoomPage from "./pages/RoomPage";
import { useEffect, useState } from "react";

const server = import.meta.env.VITE_SERVER_URL;
const connectionOptions = {
  "force new connection": true,
  reconnectionAttempts: "Infinity",
  timeout: 10000,
  transports: ["websocket"]
};

const socket = io(server, connectionOptions);

const App = () => {

  // Get user info from local storage in case of page refresh
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  return(
    <div className="w-full h-screen flex">
      <Routes>
        <Route path="/" element={<HomePage socket={socket} setUser={setUser} />} />
        <Route path="/:roomId" element={<RoomPage user={user} socket={socket} />} />
      </Routes>
    </div>
  );
}

export default App;