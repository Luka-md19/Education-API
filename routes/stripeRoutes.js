const express = require("express");
const stripeController = require("../controllers/stripeController");
const authController = require("../controllers/authController");

const router = express.Router();

router.post(
  "/create-checkout-session",
  authController.protect,
  authController.restrictTo("user"),
  stripeController.createCheckoutSession
);

router.get("/success", stripeController.handleSuccess);

router.post(
  "/success/enroll",
  authController.protect,
  stripeController.handleSuccess
);

module.exports = router;
