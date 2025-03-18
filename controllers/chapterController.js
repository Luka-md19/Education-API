const Chapter = require("../models/chapterModel");
const factory = require("./handlerFactory");

exports.SetCourseChapterIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.course) req.body.course = req.params.courseId;
  next();
};

exports.createChapter = factory.createOne(Chapter);
exports.getAllChapters = factory.getAll(Chapter);
exports.getChapter = factory.getOne(Chapter);
exports.updateChapter = factory.updateOne(Chapter);
exports.deleteChapter = factory.deleteOne(Chapter);
