const express = require("express");

const router = express.Router({ mergeParams: true });
const lecturerController = require("../controllers/lecturerController");

router
  .route("/")
  .get(lecturerController.getAllLecturers)
  .post(
    lecturerController.SetCourselecturerIds,
    lecturerController.createLecturer
  );

router
  .route("/:id")
  .get(lecturerController.getLecturer)
  .patch(lecturerController.updateLecturer)
  .delete(lecturerController.deleteLecturer);

module.exports = router;
