const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// Constants for maximum login attempts and lock time
const MAX_LOGIN_ATTEMPTS = 10;
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
    minlength: [1, "First name must have more or equal to 1 character"],
  },
  lastName: {
    type: String,
    trim: true,
    minlength: [1, "Last name must have more or equal to 1 character"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: {
    type: String,
    validate: [validator.isURL, "Please provide a valid URL for the photo"],
  },
  role: {
    type: String,
    enum: ["user", "teacher", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Provide a password"],
    minlength: 8,
    select: false,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  loginAttempts: {
    type: Number,
    required: true,
    default: 0,
    validate: {
      validator: Number.isInteger,
      message: "Login attempts must be an integer",
    },
  },
  lockUntil: Date,
  dateOfBirth: {
    type: Date,
    validate: {
      validator(value) {
        return validator.isDate(value.toString());
      },
      message: "Please provide a valid date",
    },
  },
  qrCode: {
    type: String,
  },
  points: {
    type: Number,
    default: 0,
    validate: {
      validator: Number.isInteger,
      message: "Points must be an integer",
    },
  },
  referrerId: {
    type: String,
    required: false,
  },
});

// Virtual Populate
userSchema.virtual("communityFeed", {
  ref: "CommunityFeed",
  foreignField: "user",
  localField: "_id",
});

// Add a virtual property for password confirmation
userSchema
  .virtual("passwordConfirm")
  .get(function () {
    return this._passwordConfirm;
  })
  .set(function (value) {
    this._passwordConfirm = value;
  });

// Validate that password and passwordConfirm match
userSchema.pre("save", function (next) {
  if (this.password !== this.passwordConfirm) {
    this.invalidate("passwordConfirm", "Passwords do not match");
  }
  next();
});

// Add a virtual property to check if the account is locked
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Instance method to increment login attempts and lock the account if necessary
userSchema.methods.incrementLoginAttempts = async function () {
  // If the account is currently locked and the lock has expired, reset login attempts
  if (this.lockUntil && this.lockUntil < Date.now()) {
    await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
    return;
  }

  // Otherwise, increment the login attempts
  const updates = { $inc: { loginAttempts: 1 } };
  // Lock the account if the max attempts are reached and it's not already locked
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }

  await this.updateOne(updates);
};

// Hash password with cost 12 before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Update the passwordChangedAt property for the user
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Query middleware to find only active users
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// Instance method to check if the password is correct
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check if the password was changed after the token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method to create a password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
