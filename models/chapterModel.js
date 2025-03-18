const mongoose = require("mongoose");

const { Schema } = mongoose;

const ChapterSchema = new Schema(
  {
    chapterName: { type: String, required: true },
    chapterOrder: { type: Number, required: true },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual Populate
ChapterSchema.virtual("contents", {
  ref: "Content",
  foreignField: "chapter",
  localField: "_id",
});

// Define and export the Chapter model
const Chapter = mongoose.model("Chapter", ChapterSchema);
module.exports = Chapter;
