import mongoose from "mongoose";
import dns from "dns"

dns.setServers(["1.1.1.1" , "8.8.8.8"])


const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log(
      `MongoDB connected: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MONGODB connection FAILED", error);
    throw error;
  }
};

export default connectDB;