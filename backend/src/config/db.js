import dns from "node:dns";
import mongoose from "mongoose";

// Some Windows/network DNS servers refuse MongoDB Atlas SRV queries.
// Use public DNS resolvers for Node's SRV lookup before Mongoose connects.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is not configured.");
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      family: 4,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    throw error;
  }
};

export default connectDB;
