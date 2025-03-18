const Lecturer = require("../models/lecturers.Model");
const factory = require("./handlerFactory");

exports.SetCourselecturerIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.course) req.body.course = req.params.courseId;
  next();
};

exports.createLecturer = factory.createOne(Lecturer);
exports.getAllLecturers = factory.getAll(Lecturer);
exports.getLecturer = factory.getOne(Lecturer);
exports.updateLecturer = factory.updateOne(Lecturer);
exports.deleteLecturer = factory.deleteOne(Lecturer);
