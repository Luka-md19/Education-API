const qrCodeRepository = require("../services/qrCodeRepository");
const catchAsync = require("../utils/catchAsync");

exports.generateQRCode = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const qrCode = await qrCodeRepository.generateReferralLinkForUser(userId);
  res.status(200).json({
    status: "success",
    data: {
      qrCode,
    },
  });
});

exports.redeemQRCode = catchAsync(async (req, res, next) => {
  const { userId, qrCode } = req.body;
  const result = await qrCodeRepository.redeemQRCode(userId, qrCode);
  res.status(200).json({
    status: result ? "success" : "fail",
  });
});

exports.handleReferral = catchAsync(async (req, res, next) => {
  a;
  const { referralUserId } = req.body;
  const result = await qrCodeRepository.handleReferral(referralUserId);
  res.status(200).json({
    status: result ? "success" : "fail",
  });
});

exports.getQRCodeForUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const qrCode = await qrCodeRepository.getQRCodeForUserId(userId);
  res.status(200).json({
    status: "success",
    data: {
      qrCode,
    },
  });
});
