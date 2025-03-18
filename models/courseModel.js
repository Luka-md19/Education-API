const mongoose = require("mongoose");

const { Schema } = mongoose;

// Course Schema
const CourseSchema = new Schema(
  {
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    synopses: {
      type: String,
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual Populate
CourseSchema.virtual("chapters", {
  ref: "Chapter",
  foreignField: "course",
  localField: "_id",
});

CourseSchema.virtual("lecturer", {
  ref: "Lecturer",
  foreignField: "course",
  localField: "_id",
});

module.exports = mongoose.model("Course", CourseSchema);
