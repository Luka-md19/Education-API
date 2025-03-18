const express = require("express");

const router = express.Router({ mergeParams: true });
const departmentController = require("../controllers/departmentController");
const courseRouter = require("./courseRoutes");

router.use("/:departmentId/courses", courseRouter);

router
  .route("/")
  .get(departmentController.getAllDepartments)
  .post(
    departmentController.SetDepartmentUserIds,
    departmentController.createDepartment
  );

router
  .route("/:id")
  .get(departmentController.getDepartment)
  .patch(departmentController.updateDepartment)
  .delete(departmentController.deleteDepartment);

module.exports = router;
