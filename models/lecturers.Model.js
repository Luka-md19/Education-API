const mongoose = require("mongoose");

const { Schema } = mongoose;

// Lecturer Schema
const lecturerSchema = new Schema(
  {
    lecturerName: {
      type: String,
      required: [true, "a lecturer must have a name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "a lecturer must have a description"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "a lecturer must have an image"],
      trim: true,
    },
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

const Lecturer = mongoose.model("Lecturer", lecturerSchema);
module.exports = Lecturer;
