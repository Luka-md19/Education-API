const app = require("./app");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Load environment variables from .env file
dotenv.config({ path: "./config.env" });

if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length !== 64) {
  throw new Error("ENCRYPTION_KEY must be a 32-byte hex string");
}

console.log("Connecting to MongoDB...");
console.log(`Database: ${process.env.DATABASE.replace(/<PASSWORD>/g, "***")}`);

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  encodeURIComponent(process.env.DATABASE_PASSWORD)
);

// MongoDB connection options
const mongooseOptions = {
  autoIndex: true,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
};

mongoose
  .connect(DB, mongooseOptions)
  .then(() => console.log("MongoDB connection successful!"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err.name, err.message);
  server.close(() => process.exit(1));
});

module.exports = app;
