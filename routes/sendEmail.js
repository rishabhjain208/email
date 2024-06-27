const express = require("express");
const { sendEmail } = require("../controllers/sendEmailController");
const { auth } = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/sendmail", auth, sendEmail);

module.exports = router;
