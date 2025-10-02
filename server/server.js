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
const rooms = {}; // { roomId: { img: <lastImage>, Set<socket.id> } }

io.on("connection", (socket) => {

  socket.on("userJoined", (data, ack) => {
    const { roomId } = data;

    socket.join(roomId);
    socket.roomId = roomId;

    if (!rooms[roomId]) {
      rooms[roomId] = { img: null, users: new Set() };
    }
    rooms[roomId].users.add(socket.id);

    const count = rooms[roomId].users.size;
    io.to(roomId).emit("userCountUpdate", { roomId, count });

    // Confirm join back to client
    if (ack) ack({ success: true, roomId });

    if (rooms[roomId].img) {
      socket.emit("whiteboardDataResponse", { img: rooms[roomId].img, roomId });
    }
  });

  socket.on("disconnect", () => {
    const roomId = socket.roomId;
    if (roomId && rooms[roomId]) {
      rooms[roomId].users.delete(socket.id);
      io.to(roomId).emit("userCountUpdate", {
        roomId,
        count: rooms[roomId].users.size
      });
    }
    console.log("[server] client disconnected:", socket.id);
  });  

  socket.on("whiteboardData", (data, ack) => {
    const { canvasImage, roomId } = data;

    if (roomId && rooms[roomId]) {
      rooms[roomId].img = canvasImage;
      socket.to(roomId).emit("whiteboardDataResponse", { img: canvasImage, roomId });
    }

    if (ack) ack({ ok: true, roomId });
  });

});


// Routes
app.get("/", (req, res) => {
  res.send("Test!");
});

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Server is running on port ${port}`));
