const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

const {
  Types: { ObjectId },
} = mongoose;

// Define chapters with actual course and chapter IDs
const chapters = [
  {
    _id: new ObjectId("666dfdf09c2070a8bfa199a1"),
    chapterName: "Introduction to Data Structures",
    courseId: "666df4b1d7a5dd9fb905e1a6",
  },
  {
    _id: new ObjectId("666dfdde9c2070a8bfa1999d"),
    chapterName: "Software Development Life Cycle",
    courseId: "666df4b1d7a5dd9fb905e1a6",
  },
];

// Function to generate data
const generateData = (chapters, contentPerChapter, filename) => {
  const data = [];

  chapters.forEach((chapter) => {
    for (let i = 0; i < contentPerChapter; i++) {
      data.push({
        _id: new ObjectId(),
        contentTitle: `Content Title ${i + 1} for ${chapter.chapterName}`,
        contentType: "Text",
        contentUrl: `https://example.com/content/${uuidv4()}`,
        chapter: chapter._id,
        courseId: chapter.courseId, // Include courseId for clarity if needed
      });
    }
  });

  fs.writeFileSync(
    filename,
    JSON.stringify(
      data,
      (key, value) =>
        key === "_id" || key === "chapter" || key === "courseId"
          ? value.toString()
          : value,
      2
    )
  );
  console.log(`${data.length} records written to ${filename}`);
};

const contentPerChapter = 50;
generateData(
  chapters,
  contentPerChapter,
  path.join(__dirname, "contents.json")
);
