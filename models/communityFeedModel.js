const mongoose = require("mongoose");

const communityFeedSchema = new mongoose.Schema(
  {
    contentRef: {
      type: mongoose.Schema.ObjectId,
      ref: "Content",
      required: [true, "Community feed must belong to content"],
    },
    message: {
      type: String,
      required: [true, "Message cannot be empty"],
      trim: true,
      maxlength: [2000, "Message must have less or equal to 2000 characters"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Community feed must belong to a user"],
    },
    likes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate to get answers
communityFeedSchema.virtual("answers", {
  ref: "Answer",
  foreignField: "communityFeed",
  localField: "_id",
});

// Middleware to populate user and content data
communityFeedSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "firstName lastName photo",
  })
    .populate({
      path: "contentRef",
      select: "contentTitle contentType contentUrl",
    })
    .populate({
      path: "answers",
      populate: {
        path: "user",
        select: "firstName lastName photo",
      },
    });
  next();
});

const CommunityFeed =
  mongoose.models.CommunityFeed ||
  mongoose.model("CommunityFeed", communityFeedSchema);

module.exports = CommunityFeed;
