import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RoomPage from "./pages/RoomPage";

const App = () => {
  return(
    <div className="w-full h-screen flex">
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/:roomId" element={<RoomPage/>} />
      </Routes>
    </div>
  );
}

export default App;