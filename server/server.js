const express = require("express");
const app = express();

const server = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

// Server holds a list of different rooms
// Each object in "rooms" is a room that holds the latest room image and a list of its users
const rooms = {};

// Everytime a user joins
io.on("connection", (socket) => {

  socket.on("userJoined", (data, ack) => {

    // Receive roomId from client
    // Puts users into group called roomId
    const roomId = data.roomId;
    const name = data.name;
    socket.join(roomId);
    socket.roomId = roomId;

    // If no object of roomId exists in the rooms list, intialize new room object
    // Then in the users list of that specific room, add the user who just joined
    if (!rooms[roomId]) rooms[roomId] = { img: null, users: new Set(), messages: [] };
    rooms[roomId].users.add(socket.id);

    // Recount the number of users in this specific room, and send that number to all users in the room, including the current user
    const count = rooms[roomId].users.size;
    io.to(roomId).emit("userCountUpdate", { roomId, count, name });

    // Confirm that the user join back to the client
    if (ack) ack({ success: true, roomId });

    // If the room already has an image, send that image to the user who just joined
    // Otherwise they stay with an blank canvas unless the image is updated again
    // Note that socket.emit only sends the data to the current user, it is redundant to send this data to EVERYONE
    if (rooms[roomId].img) socket.emit("whiteboardDataResponse", { img: rooms[roomId].img, roomId });

    // Send full chat log to the user who just joined (only once)
    if (rooms[roomId].messages.length > 0) {
      socket.emit("messageHistory", rooms[roomId].messages);
    }
  });

  // Handle new messages sent by users
  socket.on("message", (data) => {
    const { roomId, name, message } = data;

    // Ensure room exists
    if (!rooms[roomId]) rooms[roomId] = { img: null, users: new Set(), messages: [] };

    const newMsg = { roomId, name, message };

    // Store the message in the room
    rooms[roomId].messages.push(newMsg);

    // Send only the new message to everyone in the room
    io.to(roomId).emit("messageResponse", newMsg);
  });

  // Everytime a user disconnects
  socket.on("disconnect", () => {

    // Get the roomId of the current socket group
    // If the room exists, delete the user from the users list of that room, then send out the updated count number
    // Note that io.to(roomId).emit sends that count to all clients in the group except the current client
    const roomId = socket.roomId;
    if (roomId && rooms[roomId]) {
      rooms[roomId].users.delete(socket.id);
      io.to(roomId).emit("userCountUpdate", { roomId, count: rooms[roomId].users.size });
    }
  });  

  // Custom event channel made for keeping track of the canvas data
  socket.on("whiteboardData", (data, ack) => {

    // Recieve the latest canvas image and roomId that it came from, all this from the client aka the presenter
    const { canvasImage, roomId } = data;

    // If the room exists, assign the room image with the new updated image
    // Send that latest image to everyone in the room
    // Note that socket.to(roomId).emit will send that image to everyone execept the current client
    // It is redundant to send it to the current client because they already have the image
    if (roomId && rooms[roomId]) {
      rooms[roomId].img = canvasImage;
      socket.to(roomId).emit("whiteboardDataResponse", { img: canvasImage, roomId });
    }

    // Confirm to user that image was sent
    if (ack) ack({ ok: true, roomId });
  });

});


// Routes
app.get("/", (req, res) => {
  res.send("Test!");
});

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Server is running on port ${port}`));
