const { Server } = require("socket.io");

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on("connection", (socket) => {
    console.log("🔌 ➡️ Cliente conectado a Socket.io");
    console.log("   🆔 Socket ID:", socket.id);
    console.log("   🌐 IP:", socket.handshake.address);

    socket.on("join-admin", () => {
      console.log("👑 ➡️ Admin joined al panel de administración");
      socket.join("admin-room");
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 ❌ Cliente desconectado:", socket.id);
      console.log("   📝 Razón:", reason);
    });

    socket.on("error", (error) => {
      console.error("🔥 ❌ Error en Socket.io:", error.message);
    });
  });

  console.log("✅ Socket.io inicializado correctamente");

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initializeSocket, getIO };
