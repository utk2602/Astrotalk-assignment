const { Server } = require("socket.io");
const registerHandlers = require("./handlers");
const registerCallHandlers = require("./callHandlers");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });
  console.log("Socket.io initialized");

  io.on("connection", (socket) => {
    console.log(`New connection: ${socket.id}`);
    
    // Register chat handlers
    registerHandlers(io, socket);
    
    // Register call handlers
    registerCallHandlers(io, socket);
    
    // Store user info in socket for call functionality
    socket.on("setup", async (userData) => {
      if (typeof userData === 'object') {
        socket.userName = userData.name;
        socket.userProfilePic = userData.profilePic;
        socket.userId = userData.id;
      } else {
        socket.userId = userData;
      }
    });
  });

  return io;
};

// Export io instance for use in other modules
const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

module.exports = { initSocket, getIO };