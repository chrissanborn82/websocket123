// server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const players = {};

function debounceWithKey(func, delay) {
  const timers = new Map();

  return function (key, ...args) {
    if (timers.has(key)) {
      clearTimeout(timers.get(key));
    }

    const timeoutId = setTimeout(() => {
      func.apply(this, [key, ...args]);
      timers.delete(key);
    }, delay);

    timers.set(key, timeoutId);
  };
}

// Usage example
const moveUser = (key, data) => {
  players[data.user].x += data.x;
  players[data.user].y += data.y;
  console.log(players);
  console.log(`Function executed for key: ${key}`);
};

const debouncedMove = debounceWithKey(moveUser, 500);

app.use(express.static(path.join(__dirname, "../dist")));

// Serve the index.html file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle messages from the client
  socket.on("message", (data) => {
    console.log("Message received:", data);
    // Broadcast the message to all connected clients
    io.emit("message", data);
  });

  // Handle messages from the client
  socket.on("UserJoined", (data) => {
    console.log("UserJoined:", data);
    players[data.uuid] = { x: data.tileX, y: data.tileY };
    // Broadcast the message to all connected clients
    io.emit("UserJoined", { data, players });
  });

  socket.on("UserMoved", (data) => {
    console.log(data);
    console.log("move received", data);
    debouncedMove(data.user, data);
    io.emit("UserMoved", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
