const Faculty = require("../models/facultyModel");
const factory = require("./handlerFactory");

exports.createFaculty = factory.createOne(Faculty);
exports.getAllFaculties = factory.getAll(Faculty);
exports.getFaculty = factory.getOne(Faculty, { path: "departments" });
exports.updateFaculty = factory.updateOne(Faculty);
exports.deleteFaculty = factory.deleteOne(Faculty);
