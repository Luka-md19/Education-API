const express = require("express");
const userCourseController = require("../controllers/userCourseController");
const authController = require("../controllers/authController");

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route("/")
  .get(userCourseController.getAllUserCourses)
  .post(userCourseController.createUserCourse);

router
  .route("/:id")
  .get(userCourseController.getUserCourse)
  .patch(userCourseController.updateUserCourse)
  .delete(userCourseController.deleteUserCourse);

router.post("/updateProgress", userCourseController.updateProgress);
router.post("/reverseProgress", userCourseController.reverseProgress);

module.exports = router;
