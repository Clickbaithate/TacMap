const express = require("express");
const app = express();

const server = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store per-room data
const rooms = {}; // { roomId: { img: <lastImage> } }

io.on("connection", (socket) => {
  console.log("[server] new client connected:", socket.id);

  socket.on("userJoined", (data) => {
    const { roomId } = data;

    socket.join(roomId);

    // Initialize room state if not exists
    if (!rooms[roomId]) {
      rooms[roomId] = { img: null };
    }

    // Confirm join to this client
    socket.emit("userIsJoined", { success: true });

    // If there’s already a whiteboard image, send it to the new user
    if (rooms[roomId].img) {
      socket.emit("whiteboardDataResponse", { img: rooms[roomId].img });
    }

    // Log current users
    const usersInRoom = io.sockets.adapter.rooms.get(roomId);
    console.log(`Users in room ${roomId}:`, usersInRoom ? [...usersInRoom] : []);
  });

  socket.on("whiteboardData", (data, callback) => {
    const { canvasImage, roomId } = data;

    console.log(
      `[server] received image from room ${roomId}, length:`,
      canvasImage?.length || 0
    );

    // Save the latest image for this room
    if (roomId && rooms[roomId]) {
      rooms[roomId].img = canvasImage;

      // Broadcast only to this room (excluding sender)
      socket.to(roomId).emit("whiteboardDataResponse", { img: canvasImage });
    }

    if (callback) callback("ok"); // send ack
  });

  socket.on("disconnect", () => {
    console.log("[server] client disconnected:", socket.id);
  });
});

// Routes
app.get("/", (req, res) => {
  res.send("Test!");
});

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Server is running on port ${port}`));
