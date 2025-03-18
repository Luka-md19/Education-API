const CommunityFeed = require("../models/communityFeedModel");
const factory = require("./handlerFactory");

exports.setContentRefIds = (req, res, next) => {
  if (!req.body.contentRef) req.body.contentRef = req.params.contentId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.createCommunityFeed = factory.createOne(CommunityFeed);
exports.getAllCommunityFeeds = factory.getAll(CommunityFeed);
exports.getCommunityFeed = factory.getOne(CommunityFeed, { path: "answers" });
exports.updateCommunityFeed = factory.updateOne(CommunityFeed);
exports.deleteCommunityFeed = factory.deleteOne(CommunityFeed);
