const QRCode = require("qrcode");
const User = require("../models/userModel");
const AppError = require("../utils/appError");

class QRCodeRepository {
  async generateQRCode(text) {
    try {
      return await QRCode.toDataURL(text);
    } catch (error) {
      throw new Error("Error generating QR code");
    }
  }

  async generateReferralLinkForUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const referralLink = `http://localhost:5173/signup?ReferrerId=${userId}`;
    try {
      const qrCode = await this.generateQRCode(referralLink);
      user.qrCode = qrCode;
      await user.save();
      return qrCode;
    } catch (error) {
      throw new AppError("Error generating QR code", 500);
    }
  }

  async handleReferral(referralUserId) {
    const referredUser = await User.findById(referralUserId);
    if (!referredUser) {
      throw new AppError("Referred user not found", 404);
    }

    const referringUser = await User.findById(referredUser.referrerId);
    if (!referringUser) {
      throw new AppError("Referring user not found", 404);
    }

    referringUser.points += 20;
    await referringUser.save();
    return true;
  }

  async createUser(data) {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      referrerId,
      passwordConfirm,
    } = data;

    // Check if referrer ID exists
    let referrer = null;
    if (referrerId) {
      referrer = await User.findById(referrerId);
      if (!referrer) {
        throw new AppError("Referring user not found", 404);
      }
    }

    // Create new user
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      referrerId: referrerId || null,
      passwordConfirm, // Pass it here so that the validation can be done in the model
    });

    // Generate QR code for the new user
    const referralLink = `http://localhost:5173/signup?ReferrerId=${newUser._id}`;
    const qrCode = await this.generateQRCode(referralLink);
    newUser.qrCode = qrCode;
    await newUser.save();

    // Handle referral if applicable
    if (referrerId) {
      await this.handleReferral(newUser._id);
    }

    return newUser;
  }
}

module.exports = new QRCodeRepository();
