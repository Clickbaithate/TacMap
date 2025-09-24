const express = require("express");
const app = express();

const server = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

io.on("connection", (socket) => {
  socket.on("userJoined", (data) => {
    const { name, userId, roomId, host, presenter } = data;
    socket.join(roomId);
    socket.emit("userIsJoined", { success: true });

    const usersInRoom = io.sockets.adapter.rooms.get(roomId);
    console.log(`Users in room ${roomId}:`, usersInRoom ? [...usersInRoom] : []);
  });
});

// Routes
app.get("/", (req, res) => {
  res.send("Test!")
});

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Server is running on port ${port}`));