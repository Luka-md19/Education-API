const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");
const qrCodeService = require("../services/qrCodeService");
const QRCodeRepository = require("../services/qrCodeRepository");
// Function to sign a JWT token for a user
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
  };

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    password,
    passwordConfirm,
    role,
    referrerId,
  } = req.body;

  // Create new user and handle referral logic
  const newUser = await QRCodeRepository.createUser({
    firstName,
    lastName,
    email,
    password,
    passwordConfirm,
    role,
    referrerId,
  });

  // Send response with token
  createSendToken(newUser, 201, res);
});
// Login user
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // 2) Check if user exists and select password field for comparison
  const user = await User.findOne({ email }).select("+password");

  // Log the user for debugging
  console.log("User found:", user);

  // 3) If user does not exist or is not found, send an error response
  if (!user) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // 4) Check if the account is locked due to too many failed login attempts
  if (user.isLocked) {
    return next(
      new AppError(
        "Your account is locked due to too many failed login attempts. Please try again later.",
        403
      )
    );
  }

  // 5) Verify if the provided password is correct
  const isPasswordCorrect = await user.correctPassword(password, user.password);
  console.log("Is password correct:", isPasswordCorrect);

  if (!isPasswordCorrect) {
    // 5.1) Increment login attempts if password is incorrect
    await user.incrementLoginAttempts();
    return next(new AppError("Incorrect email or password", 401));
  }

  // 6) Reset login attempts and lock status if login is successful
  if (user.loginAttempts > 0 || user.lockUntil) {
    await user.updateOne({
      $set: { loginAttempts: 0 },
      $unset: { lockUntil: 1 },
    });
  }

  // 7) If everything is okay, send token to client
  createSendToken(user, 200, res);
});

// // Protect routes to ensure user is logged in
// exports.protect = catchAsync(async (req, res, next) => {
//     // 1) Get token and check if it's there
//     let token;
//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//         token = req.headers.authorization.split(' ')[1];
//     }
//     if (!token) {
//         return next(new AppError('You are not logged in! Please log in to get access.', 401));
//     }

//     console.log('Token:', token);  // Log the token for debugging
//     // 2) Verify token
//     const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
//     console.log(decoded);
//     // 3) Check if user still exists
//     const FreshUser = await User.findById(decoded.id);
//     if (!FreshUser) {
//         return next(new AppError('The user belonging to this token does no longer exist...', 401));
//     }
//     // 4) Check if user changed password after the token was issued
//     if (FreshUser.changedPasswordAfter(decoded.iat)) {
//         return next(new AppError('User recently changed password! Please log in again.', 401));
//     }
//     // Grant access to protected route
//     req.user = FreshUser;
//     next();
// });

// exports.protect = catchAsync(async (req, res, next) => {
//     let token;
//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//         token = req.headers.authorization.split(' ')[1];
//     } else if (req.query.token) {
//         token = req.query.token;
//     }

//     if (!token) {
//         return next(new AppError('You are not logged in! Please log in to get access.', 401));
//     }

//     try {
//         const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
//         const FreshUser = await User.findById(decoded.id);

//         if (!FreshUser) {
//             return next(new AppError('The user belonging to this token does no longer exist.', 401));
//         }

//         if (FreshUser.changedPasswordAfter(decoded.iat)) {
//             return next(new AppError('User recently changed password! Please log in again.', 401));
//         }

//         req.user = FreshUser;
//         next();
//     } catch (error) {
//         console.error('Error in protect middleware:', error);
//         return next(new AppError('Invalid token. Please log in again.', 401));
//     }
// });

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  const decoded = await jwt.verify(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  req.user = currentUser;
  next();
});

exports.getChaptersAndContentsByCourseId = catchAsync(
  async (req, res, next) => {
    const { courseId } = req.params;
    const userId = req.user._id;

    const chapters = await Chapter.find({ course: courseId }).populate(
      "contents"
    );
    if (!chapters || chapters.length === 0) {
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

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };

// Send password reset token to user's email
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError("There is no user with the provided email address.", 404)
    );
  }
  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email.`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });
    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }
});
// Reset user's password
exports.resetPassword = catchAsync(async (req, res, next) => {
  console.log("Reset Password Endpoint Hit");
  // Hash the token received from the URL
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  console.log("Hashed Token:", hashedToken);
  // Find the user by the token and check if the token has not expired
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  // Update user's password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // Sign a new token for the user
  createSendToken(user, 200, res);
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from the collection
  const user = await User.findById(req.user.id).select("+password");
  // 2) Check if posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong.", 401));
  }
  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // Use `User.findByIdAndUpdate` will NOT work as intended
  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});
