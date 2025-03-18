const mongoose = require("mongoose");

const { Schema } = mongoose;

// Department Schema
const DepartmentSchema = new Schema(
  {
    departmentName: {
      type: String,
      required: [true, "A department must have a name"],
      unique: true,
      trim: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual Populate
DepartmentSchema.virtual("courses", {
  ref: "Course",
  foreignField: "department",
  localField: "_id",
});

const Department = mongoose.model("Department", DepartmentSchema);
module.exports = Department;
