const express = require("express");

const router = express.Router({ mergeParams: true });
const answerController = require("../controllers/answerController");
const authController = require("../controllers/authController");

router.use(authController.protect); // Protect all routes

router
  .route("/")
  .get(answerController.getAllAnswers)
  .post(
    authController.restrictTo("user", "admin"),
    answerController.setCommunityFeedIds,
    answerController.createAnswer
  );

router
  .route("/:id")
  .get(answerController.getAnswer)
  .patch(
    authController.restrictTo("user", "admin"),
    answerController.updateAnswer
  )
  .delete(authController.restrictTo("admin"), answerController.deleteAnswer);

module.exports = router;
