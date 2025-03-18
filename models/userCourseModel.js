const mongoose = require("mongoose");

const userCourseSchema = new mongoose.Schema({
  progress: {
    type: Number,
    required: false,
    min: 0,
    max: 100,
    default: 0,
  },
  completedContents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Content",
    },
  ],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  totalContents: {
    type: Number,
    default: 0,
  },
});

// Ensure virtual fields are serialized
userCourseSchema.set("toJSON", { virtuals: true });
userCourseSchema.set("toObject", { virtuals: true });

// Adding indexes
userCourseSchema.index({ userId: 1, courseId: 1 }); // Compound index
userCourseSchema.index({ courseId: 1 }); // Single field index

const UserCourse = mongoose.model("UserCourse", userCourseSchema);
module.exports = UserCourse;
