const Course = require("../models/courseModel");
const Chapter = require("../models/chapterModel");
const Content = require("../models/contentModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Lecturer = require("../models/lecturers.Model");
const UserCourse = require("../models/userCourseModel");
const promClient = require("prom-client");

// Middleware to set course user IDs
exports.SetCourseUserIds = (req, res, next) => {
  if (!req.body.department) req.body.department = req.params.departmentId;
  next();
};

// CRUD operations for courses
exports.createCourse = factory.createOne(Course);
exports.getAllCourses = async (req, res, next) => {
  const end = requestDurationHistogram.startTimer(); // Start the timer
  requestCounter.inc({ method: req.method }); // Increment the counter

  try {
    const result = await factory.getAll(Course)(req, res, next); // Call the original function
    end({ method: req.method }); // Stop the timer and record the duration
    return result;
  } catch (err) {
    end({ method: req.method }); // Stop the timer and record the duration even if there's an error
    next(err);
  }
};
exports.getCourse = factory.getOne(Course);
exports.updateCourse = factory.updateOne(Course);
exports.deleteCourse = factory.deleteOne(Course);
exports.deleteAllCourses = factory.deleteAll(Course);

// Fetch chapters and contents by course ID
exports.getChaptersAndContentsByCourseId = catchAsync(
  async (req, res, next) => {
    const { courseId } = req.params;
    const { _id: userId } = req.user;

    const chapters = await Chapter.find({ course: courseId }).populate(
      "contents"
    );
    if (!chapters.length) {
      return next(
        new AppError("No chapters found for the course with that ID", 404)
      );
    }

    const userProgress = await UserCourse.findOne({ courseId, userId });
    if (!userProgress) {
      return next(
        new AppError("No progress found for the user in this course", 404)
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        chapters,
        userProgress,
      },
    });
  }
);

// Fetch chapters and lecturers by course ID
exports.getChaptersAndLecturersByCourseId = catchAsync(
  async (req, res, next) => {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return next(new AppError("No course found with that ID", 404));
    }

    const lecturers = await Lecturer.find({ course: courseId });
    if (!lecturers.length) {
      return next(
        new AppError("No lecturers found for the course with that ID", 404)
      );
    }

    const chapters = await Chapter.find({ course: courseId });
    if (!chapters.length) {
      return next(
        new AppError("No chapters found for the course with that ID", 404)
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        courseName: course.courseName,
        price: course.price,
        synopses: course.synopses,
        lecturers,
        chapters,
      },
    });
  }
);

// Fetch enrolled courses for the user
exports.getEnrolledCourses = catchAsync(async (req, res, next) => {
  const enrolledCourses = await UserCourse.find({
    userId: req.user.id,
  }).populate("courseId");

  res.status(200).json({
    status: "success",
    data: {
      courses: enrolledCourses.map((enrollment) => enrollment.courseId),
    },
  });
});

// Create a counter for the number of requests
const requestCounter = new promClient.Counter({
  name: "course_requests_total",
  help: "Total number of requests to get all courses",
  labelNames: ["method"],
});

// Create a histogram for the request duration
const requestDurationHistogram = new promClient.Histogram({
  name: "course_request_duration_seconds",
  help: "Duration of requests to get all courses in seconds",
  labelNames: ["method"],
});
