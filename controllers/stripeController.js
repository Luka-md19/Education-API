const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Course = require("../models/courseModel");
const Chapter = require("../models/chapterModel");
const UserCourse = require("../models/userCourseModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createCheckoutSession = catchAsync(async (req, res, next) => {
  const { courseIds } = req.body;

  const courses = await Course.find({ _id: { $in: courseIds } });

  if (!courses.length) {
    return next(new AppError("No courses found with those IDs", 404));
  }

  const userId = req.user.id;
  const token = req.headers.authorization.split(" ")[1];

  const lineItems = courses.map((course) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: course.courseName,
      },
      unit_amount: course.price * 100,
    },
    quantity: 1,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/api/v1/stripe/success?session_id={CHECKOUT_SESSION_ID}&courseIds=${courseIds.join(",")}&token=${token}`,
    cancel_url: `${req.protocol}://${req.get("host")}/cancel`,
    metadata: {
      courseIds: courseIds.join(","),
      userId,
    },
  });

  res.status(200).json({
    status: "success",
    session,
  });
});

exports.handleSuccess = catchAsync(async (req, res, next) => {
  const { session_id, courseIds, token } = req.query;

  if (!token) {
    return next(new AppError("No token provided", 401));
  }

  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session && session.payment_status === "paid") {
      const courseIdArray = courseIds.split(",");

      for (const courseId of courseIdArray) {
        // Add detailed logging
        console.log(`Fetching chapters for courseId: ${courseId}`);

        const chapters = await Chapter.find({ course: courseId }).populate(
          "contents"
        );

        // Add detailed logging
        console.log(`Chapters found: ${chapters.length}`);

        const totalContents = chapters.reduce(
          (sum, chapter) => sum + chapter.contents.length,
          0
        );

        // Add detailed logging
        console.log(`Total contents calculated: ${totalContents}`);

        await UserCourse.create({
          userId,
          courseId,
          totalContents,
          progress: 0, // Initial progress
          completedContents: [],
        });

        // Add detailed logging
        console.log(
          `UserCourse created for userId: ${userId} and courseId: ${courseId}`
        );
      }

      // Redirect to frontend success page route
      res
        .status(200)
        .redirect(`${req.protocol}://${req.get("host")}/success-page`);
    } else {
      res
        .status(400)
        .json({ status: "fail", message: "Payment not successful" });
    }
  } catch (error) {
    // Add detailed logging for error
    console.error("Error in handleSuccess:", error);
    res
      .status(500)
      .json({ status: "error", message: "Internal Server Error", error });
  }
});
