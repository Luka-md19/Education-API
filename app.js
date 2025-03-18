const express = require("express");
const dotenv = require("dotenv");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const loggerMiddleware = require("./utils/loggerMiddleware");
const promClient = require("prom-client");

// Load environment variables from .env file
dotenv.config({ path: "./config.env" });

const logger = require("./logger");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const facultyRouter = require("./routes/facultyRoutes");
const departmentRouter = require("./routes/departmentRoutes");
const courseRouter = require("./routes/courseRoutes");
const chapterRouter = require("./routes/chapterRoutes");
const contentRouter = require("./routes/contentRoutes");
const lecturerRouter = require("./routes/lecturerRoutes");
const userRouter = require("./routes/userRoutes");
const qrCodeRouter = require("./routes/qrCodeRoutes");
const communityFeedRouter = require("./routes/communityFeedRoutes");
const answerRouter = require("./routes/answerRoutes");
const stripeRouter = require("./routes/stripeRoutes");
const userCourseRouter = require("./routes/userCourseRoutes");

const app = express();

// Create a Registry which registers the metrics
const register = new promClient.Registry();

// Add a default metrics collection
promClient.collectDefaultMetrics({ register });

// Define custom metrics
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: "http_request_duration_ms",
  help: "Duration of HTTP requests in ms",
  labelNames: ["method", "route", "code"],
  buckets: [50, 100, 200, 300, 400, 500], // Bucket boundaries for the histogram
});

// Register the histogram
register.registerMetric(httpRequestDurationMicroseconds);

// Middleware to collect metrics
app.use((req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on("finish", () => {
    end({
      route: req.route ? req.route.path : "",
      code: res.statusCode,
      method: req.method,
    });
  });
  next();
});

// Metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// Set security HTTP headers
app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    allowedHeaders: "Content-Type, Authorization",
  })
);

// Use Morgan for HTTP request logging
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()), // Use Winston for logging
    },
  })
);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Body parser, reading data from body into req.body
app.use(express.json());

// Metrics and logging middleware
app.use(loggerMiddleware);

// Static file serving middleware
const reactAppPath = path.join(__dirname, "../client/dist"); // Adjust this path if necessary
app.use(express.static(reactAppPath));

// Routes
app.use("/api/v1/faculties", facultyRouter);
app.use("/api/v1/departments", departmentRouter);
app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/chapters", chapterRouter);
app.use("/api/v1/contents", contentRouter);
app.use("/api/v1/lecturers", lecturerRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/qrcodes", qrCodeRouter);
app.use("/api/v1/contents/:contentId/communityFeeds", communityFeedRouter);
app.use("/api/v1/communityFeeds", communityFeedRouter);
app.use("/api/v1/communityFeeds/:communityFeedId/answers", answerRouter);
app.use("/api/v1/answers", answerRouter);
app.use("/api/v1/stripe", stripeRouter);
app.use("/api/v1/user-courses", userCourseRouter);

// Serve static files from the React frontend app
app.use(express.static(reactAppPath));

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get("*", (req, res) => {
  res.sendFile(path.join(reactAppPath, "index.html"));
});

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
