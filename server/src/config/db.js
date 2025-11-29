import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI or MONGO_URI in environment");
  }

  try {
    await mongoose.connect(uri, {
      autoIndex: true,
    });
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;

