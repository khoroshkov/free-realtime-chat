const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/formatMessage");
const { userJoin, getUser, userLeave, getRoom } = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static page
app.use(express.static(path.join(__dirname, "public")));

const botName = "Chat Bot";

// Run when client connects
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    socket.emit(
      "message",
      formatMessage(botName, `${username}, welcome to Realtime chat!`)
    );

    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoom(user.room),
    });
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat room`)
      );

      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoom(user.room),
      });
    }
  });

  socket.on("chatMessage", (msg) => {
    const user = getUser(socket.id);
    io.to(user.room).emit("message", formatMessage(`${user.username}`, msg));
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
