const express = require("express");
const qrCodeController = require("../controllers/qrCodeController");

const router = express.Router();

router.get("/:userId", qrCodeController.generateQRCode);
router.post("/redeem", qrCodeController.redeemQRCode);
router.post("/referral", qrCodeController.handleReferral);
router.get("/user/:userId", qrCodeController.getQRCodeForUser);

module.exports = router;
