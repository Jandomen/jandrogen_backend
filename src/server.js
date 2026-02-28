require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const { initializeSocket } = require("./config/socket");
const http = require("http");

const PORT = process.env.PORT;

(async () => {
  await connectDB();

  const server = http.createServer(app);
  
  initializeSocket(server);

  server.listen(PORT, () => {
    console.log(`🚀 JANDROGEN API running on port ${PORT}`);
    console.log(`🔌 Socket.io listening for real-time events`);
  });
})();
