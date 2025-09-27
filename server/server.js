const express = require("express");
const app = express();

const server = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

let roomIdGlobal, imgGlobal;

io.on("connection", (socket) => {
  socket.on("userJoined", (data) => {
    const { name, userId, roomId, host, presenter } = data;
    roomIdGlobal = roomId;
    socket.join(roomId);
    socket.emit("userIsJoined", { success: true });
    socket.broadcast.to(roomId).emit("whiteboardDataResponse", {
      img: imgGlobal
    });

    const usersInRoom = io.sockets.adapter.rooms.get(roomId);
    console.log(`Users in room ${roomId}:`, usersInRoom ? [...usersInRoom] : []);
  });

  socket.on("whiteboardData", (data) => {
    imgGlobal = data.canvasImage;
    socket.broadcast.to(roomIdGlobal).emit("whiteboardDataResponse", {
      img: data.canvasImage
    });
  });
});

// Routes
app.get("/", (req, res) => {
  res.send("Test!")
});

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Server is running on port ${port}`));