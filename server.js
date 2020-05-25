const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messsages");
const { userJoin, getCurrentUser } = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const CHAT_BOT_USER = "bot_user";

io.on("connection", (socket) => {
  socket.on("joinroom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    socket.emit(
      "message",
      formatMessage(CHAT_BOT_USER, "Welcome to Chat Room")
    );
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(CHAT_BOT_USER, `${user.username} has joined the chat`)
      );
  });

  socket.on("chatMessage", (msg) => {
    console.log(msg);
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
    socket.on("disconnect", () => {
      io.emit(
        "message",
        formatMessage(CHAT_BOT_USER, `${user.username} had left the chat`)
      );
    });
  });
});

const PORT = 3000 || process.env.PORT;

app.use(express.static(path.join(__dirname, "public")));

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
