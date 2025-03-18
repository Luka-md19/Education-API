const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables from the config.env file in the server root directory
dotenv.config({ path: path.join(__dirname, "../config.env") });

const Content = require("../models/contentModel");
const CommunityFeed = require("../models/communityFeedModel");
const Answer = require("../models/answerModel");

console.log("Connecting to MongoDB for data import...");
const encodedPassword = encodeURIComponent(process.env.DATABASE_PASSWORD);
const DB = process.env.DATABASE.replace("<PASSWORD>", encodedPassword);

const mongooseOptions = {
  autoIndex: true,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
};

mongoose
  .connect(DB, mongooseOptions)
  .then(() => console.log("DB connection successful for data import!"))
  .catch((err) => {
    console.error("DB connection error:", err);
    process.exit(1);
  });

// Load JSON data
const contents = JSON.parse(
  fs.readFileSync(path.join(__dirname, "contents.json"), "utf-8")
);

// Import data into the database
const importData = async () => {
  try {
    await Content.create(contents);
    console.log("Data successfully loaded!");
  } catch (err) {
    console.error(err);
  }
  process.exit();
};

// Delete all data from the database
const deleteData = async () => {
  try {
    await Content.deleteMany();
    await CommunityFeed.deleteMany();
    await Answer.deleteMany();
    console.log("Data deleted successfully");
  } catch (err) {
    console.error(err);
  }
  process.exit();
};

// Generate Community Feed Questions and Answers
const generateCommunityFeedsAndAnswers = async () => {
  try {
    for (const content of contents) {
      const communityFeed = await CommunityFeed.create({
        contentRef: content._id,
        message: `What do you think about ${content.contentTitle}?`,
        user: new mongoose.Types.ObjectId(), // Replace with an actual user ID
      });

      await Answer.create({
        content: `This is an answer to the question about ${content.contentTitle}`,
        user: new mongoose.Types.ObjectId(), // Replace with an actual user ID
        communityFeed: communityFeed._id,
      });

      console.log(
        `Community feed and answer created for content ID: ${content._id}`
      );
    }
    console.log("Community feeds and answers successfully created!");
  } catch (err) {
    console.error(err);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
} else if (process.argv[2] === "--import-community-feeds") {
  generateCommunityFeedsAndAnswers();
}

// Display command line arguments (for debugging purposes)
console.log(process.argv);
