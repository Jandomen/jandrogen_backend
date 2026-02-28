const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, 
    });

    console.log("✅ MongoDB connected");
    console.log(`📦 Host: ${conn.connection.host}`);
    console.log(`🗄️  DB: ${conn.connection.name}`);

    mongoose.connection.on("error", err => {
      console.error("❌ MongoDB runtime error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn(" ⚠️ MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB reconnected");
    });

  } catch (error) {
    console.error("❌ MongoDB initial connection failed");
    console.error(error.message);

    process.exit(1);
  }
};

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("🛑 MongoDB connection closed");
  process.exit(0);
});

module.exports = connectDB;
