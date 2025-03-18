const express = require("express");

const router = express.Router({ mergeParams: true });
const facultyController = require("../controllers/facultyController");
const departmentRouter = require("./departmentRoutes");

router.use("/:facultyId/departments", departmentRouter);
router
  .route("/")
  .get(facultyController.getAllFaculties)
  .post(facultyController.createFaculty);

router
  .route("/:id")
  .get(facultyController.getFaculty)
  .patch(facultyController.updateFaculty)
  .delete(facultyController.deleteFaculty);

module.exports = router;
