const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, "Answer content cannot be empty"],
    trim: true,
    maxlength: [
      2000,
      "Answer content must have less or equal to 2000 characters",
    ],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Answer must belong to a user"],
  },
  communityFeed: {
    type: mongoose.Schema.ObjectId,
    ref: "CommunityFeed",
    required: [true, "Answer must belong to a community feed"],
  },
  likes: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
});

// Middleware to populate user data
answerSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "firstName lastName photo",
  });
  next();
});

const Answer = mongoose.models.Answer || mongoose.model("Answer", answerSchema);

module.exports = Answer;
