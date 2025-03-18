const express = require("express");

const router = express.Router({ mergeParams: true });
const contentController = require("../controllers/contentController");

// Route for deleting all contents
router.route("/deleteAll").delete(contentController.deleteAllContents);

// Other routes
router
  .route("/")
  .get(contentController.getAllContents)
  .post(
    contentController.SetContentChapterIds,
    contentController.createContent
  );

router
  .route("/:id")
  .get(contentController.getContent)
  .patch(contentController.updateContent)
  .delete(contentController.deleteContent);

module.exports = router;
