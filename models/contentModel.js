const mongoose = require("mongoose");
const UserCourse = require("./userCourseModel");

const { Schema } = mongoose;

const ContentSchema = new Schema(
  {
    contentTitle: {
      type: String,
      required: [true, "please provide a content title"],
    },
    contentType: {
      type: String,
      required: true,
      enum: ["Video", "Text", "Quiz"],
    },
    contentUrl: {
      type: String,
      required: true,
    },
    //   duration: {
    //     type: Number, // Duration in seconds
    //     required: false,
    //   },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual Populate
ContentSchema.virtual("communityFeeds", {
  ref: "CommunityFeed",
  foreignField: "content",
  localField: "_id",
});

ContentSchema.virtual("user-courses", {
  ref: "UserCourse",
  foreignField: "content",
  localField: "_id",
});

// Function to update totalContents in UserCourse based on the given chapterId
async function updateTotalContents(chapterId) {
  // Find the chapter by its ID and populate the 'contents' field
  const chapter = await Chapter.findById(chapterId).populate("contents");

  // Calculate the total number of contents in the chapter
  const totalContents = chapter.contents.length;

  // Find all UserCourse documents that reference the course ID of the chapter
  const userCourses = await UserCourse.find({ courseId: chapter.course });

  // Iterate over each UserCourse document
  userCourses.forEach(async (userCourse) => {
    // Update the totalContents field in the UserCourse document
    userCourse.totalContents = totalContents;

    // Save the updated UserCourse document to the database
    await userCourse.save();
  });

  // Pre-Save middleware to update totalcontetns when a content is added or updated

  ContentSchema.pre("save", async function (next) {
    await updateTotalContents(this.chapter);
    next();
  });

  // pre-remove middleware to update totalContents when content is deleted
  ContentSchema.pre("remove", async function (next) {
    await updateTotalContents(this.chapter);
    next();
  });
}

module.exports = mongoose.model("Content", ContentSchema);
