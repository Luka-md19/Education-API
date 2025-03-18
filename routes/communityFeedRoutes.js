const express = require("express");

const router = express.Router({ mergeParams: true });
const communityFeedController = require("../controllers/communityFeedController");
const authController = require("../controllers/authController");

router.use(authController.protect);

router
  .route("/")
  .get(communityFeedController.getAllCommunityFeeds)
  .post(
    authController.restrictTo("user", "admin"),
    communityFeedController.setContentRefIds,
    communityFeedController.createCommunityFeed
  );

router
  .route("/:id")
  .get(communityFeedController.getCommunityFeed)
  .patch(
    authController.restrictTo("user", "admin"),
    communityFeedController.updateCommunityFeed
  )
  .delete(
    authController.restrictTo("admin"),
    communityFeedController.deleteCommunityFeed
  );

module.exports = router;
