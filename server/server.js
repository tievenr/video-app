require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: { origin: "*" }, // Allow requests from any origin
});
const PORT = process.env.PORT || 3000; // Use the specified port or default to 3000

io.on("connection", (socket) => {
  console.log("Connected");

  socket.on("message", (message) => {
    socket.broadcast.emit("message", message);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected");
  });
});

function error(err, req, res, next) {
  // log it
  if (!test) console.error(err.stack);

  // respond with 500 "Internal Server Error".
  res.status(500);
  res.send("Internal Server Error");
}
app.use(error);

server.listen(PORT, () => {
  console.log(`Listening on Port ${PORT}`);
});
