const Answer = require("../models/answerModel");
const factory = require("./handlerFactory");

exports.setCommunityFeedIds = (req, res, next) => {
  if (!req.body.communityFeed)
    req.body.communityFeed = req.params.communityFeedId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.createAnswer = factory.createOne(Answer);
exports.getAllAnswers = factory.getAll(Answer);
exports.getAnswer = factory.getOne(Answer);
exports.updateAnswer = factory.updateOne(Answer);
exports.deleteAnswer = factory.deleteOne(Answer);
