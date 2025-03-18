const Content = require("../models/contentModel");
const factory = require("./handlerFactory");

exports.SetContentChapterIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.chapter) req.body.chapter = req.params.chapterId;
  next();
};

exports.createContent = factory.createOne(Content);
exports.getAllContents = factory.getAll(Content);
exports.getContent = factory.getOne(Content, { path: "user-courses" });
exports.updateContent = factory.updateOne(Content);
exports.deleteContent = factory.deleteOne(Content);
exports.deleteAllContents = factory.deleteAll(Content);
