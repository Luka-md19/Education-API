const Department = require("../models/departmentModel");
const factory = require("./handlerFactory");

exports.SetDepartmentUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.faculty) req.body.faculty = req.params.facultyId;
  next();
};

exports.createDepartment = factory.createOne(Department);
exports.getAllDepartments = factory.getAll(Department);
exports.getDepartment = factory.getOne(Department, { path: "courses" });
exports.updateDepartment = factory.updateOne(Department);
exports.deleteDepartment = factory.deleteOne(Department);
