const UserCourse = require("../models/userCourseModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handlerFactory");
const Chapter = require("../models/chapterModel");
const Content = require("../models/contentModel");
const {
  setUserCourseProgress,
  getUserCourseProgress,
} = require("../utils/cacheUtils");

exports.updateTotalContents = async (courseId) => {
  const chapters = await Chapter.find({ course: courseId }).populate(
    "contents"
  );
  const totalContents = chapters.reduce(
    (sum, chapter) => sum + chapter.contents.length,
    0
  );
  await UserCourse.updateMany({ courseId }, { totalContents });
};

const updateCourseProgress = async (userCourse, userId, courseId) => {
  if (userCourse.totalContents > 0) {
    userCourse.progress =
      (userCourse.completedContents.length / userCourse.totalContents) * 100;
    if (userCourse.progress > 100) {
      userCourse.progress = 100;
    }
  } else {
    userCourse.progress = 0;
  }

  await userCourse.save();
  await setUserCourseProgress(userId, courseId, userCourse.progress);
};

exports.updateProgress = catchAsync(async (req, res, next) => {
  const { userId, contentId, courseId } = req.body;

  const userCourse = await UserCourse.findOne({ userId, courseId });
  if (!userCourse) {
    return next(new AppError("User is not enrolled in this course", 404));
  }

  const content = await Content.findOne({ _id: contentId }).populate({
    path: "chapter",
    match: { course: courseId },
  });
  if (!content) {
    return next(
      new AppError("Content does not belong to the specified course", 400)
    );
  }

  if (!userCourse.completedContents.includes(contentId)) {
    userCourse.completedContents.push(contentId);
    await updateCourseProgress(userCourse, userId, courseId);
  }

  res.status(200).json({
    status: "success",
    data: userCourse,
  });
});

exports.reverseProgress = catchAsync(async (req, res, next) => {
  const { userId, contentId, courseId } = req.body;

  const userCourse = await UserCourse.findOne({ userId, courseId });
  if (!userCourse) {
    return next(new AppError("User is not enrolled in this course", 404));
  }

  const contentIndex = userCourse.completedContents.indexOf(contentId);
  if (contentIndex > -1) {
    userCourse.completedContents.splice(contentIndex, 1);
    await updateCourseProgress(userCourse, userId, courseId);
  }

  res.status(200).json({
    status: "success",
    data: userCourse,
  });
});

exports.createUserCourse = factory.createOne(UserCourse);
exports.getAllUserCourses = factory.getAll(UserCourse);
exports.getUserCourse = factory.getOne(UserCourse);
exports.updateUserCourse = factory.updateOne(UserCourse);
exports.deleteUserCourse = factory.deleteOne(UserCourse);
