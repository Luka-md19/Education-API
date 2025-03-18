const express = require("express");

const router = express.Router({ mergeParams: true });
const chapterController = require("../controllers/chapterController");
const contentRouter = require("./contentRoutes");

router.use("/:chapterId/contents", contentRouter);

router
  .route("/")
  .get(chapterController.getAllChapters)
  .post(chapterController.SetCourseChapterIds, chapterController.createChapter);

router
  .route("/:id")
  .get(chapterController.getChapter)
  .patch(chapterController.updateChapter)
  .delete(chapterController.deleteChapter);

module.exports = router;
