const express = require("express");
const app = express();

const server = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { cors: { origin: "*" } });

let rooms = {}; // { roomId: { imgURL: "" } }

io.on("connection", (socket) => {
  socket.on("userJoined", ({ roomId }) => {
    socket.join(roomId);

    // Send the current board state to the new user
    if (rooms[roomId]?.imgURL) {
      socket.emit("whiteboardDataResponse", { imgURL: rooms[roomId].imgURL });
    }
  });

  socket.on("whiteboardData", ({ roomId, imgURL }) => {
    if (!rooms[roomId]) rooms[roomId] = {};
    rooms[roomId].imgURL = imgURL;

    // Broadcast to others in the same room
    socket.to(roomId).emit("whiteboardDataResponse", { imgURL });
  });
});

app.get("/", (req, res) => {
  res.send("Server running!");
});

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Server is running on port ${port}`));
