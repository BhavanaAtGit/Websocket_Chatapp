const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// Apply CORS middleware to allow requests from the Netlify domain
app.use(cors({
  origin: 'https://websocketchatapp.netlify.app', // Ensure this is the correct origin of your Netlify frontend without trailing slash
  methods: ["GET", "POST"],
}));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'https://websocketchatapp.netlify.app', // Ensure this is the correct origin of your Netlify frontend without trailing slash
    methods: ["GET", "POST"],
  },
});

// Store users
let users = {
  attendant: null,
  passenger: null,
};

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // User joins as either attendant or passenger
  socket.on("join", (role) => {
    if (role === "attendant") {
      users.attendant = socket.id;
      console.log("Attendant joined");
    } else if (role === "passenger") {
      users.passenger = socket.id;
      console.log("Passenger joined");
    }
  });

  // Sending messages between attendant and passenger
  socket.on("send_message", (data) => {
    const recipientId =
      data.userType === "attendant" ? users.passenger : users.attendant;
    if (recipientId) {
      io.to(recipientId).emit("receive_message", {
        message: data.message,
      });
    }
  });

  // On disconnect
  socket.on("disconnect", () => {
    if (users.attendant === socket.id) {
      users.attendant = null;
    } else if (users.passenger === socket.id) {
      users.passenger = null;
    }
    console.log("User disconnected");
  });
});

// Server runs on port 3001
server.listen(3001, () => {
  console.log("SERVER IS RUNNING on port 3001");
});
