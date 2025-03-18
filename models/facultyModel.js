const mongoose = require("mongoose");

const { Schema } = mongoose;

// Faculty Schema
const FacultySchema = new Schema(
  {
    facultyName: {
      type: String,
      required: [true, "A faculty must have a name"],
      unique: true,
      trim: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual Populate
FacultySchema.virtual("departments", {
  ref: "Department",
  foreignField: "faculty",
  localField: "_id",
});

const Faculty = mongoose.model("Faculty", FacultySchema);
module.exports = Faculty;
