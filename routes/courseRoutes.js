const express = require("express");
const courseController = require("../controllers/courseController");
const authController = require("../controllers/authController");
const chapterRouter = require("./chapterRoutes");
const lecturerRouter = require("./lecturerRoutes");

const router = express.Router({ mergeParams: true });

// // Protect all routes after this middleware
router.use(authController.protect);

router.use("/:courseId/chapters", chapterRouter);
router.use("/:courseId/lecturer", lecturerRouter);

router.route("/deleteAll").delete(courseController.deleteAllCourses);

router
  .route("/")
  .get(courseController.getAllCourses)
  .post(courseController.SetCourseUserIds, courseController.createCourse);

router
  .route("/learn/by-courseId/:courseId")
  .get(
    authController.protect,
    courseController.getChaptersAndContentsByCourseId
  );

router
  .route("/Courses/:courseId")
  .get(courseController.getChaptersAndLecturersByCourseId);

router
  .route("/:id")
  .get(courseController.getCourse)
  .patch(authController.protect, courseController.updateCourse)
  .delete(authController.protect, courseController.deleteCourse);

module.exports = router;
