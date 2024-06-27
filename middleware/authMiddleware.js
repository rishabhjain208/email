const jwt = require("jsonwebtoken");

exports.auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    // console.log(authHeader);
    if (!authHeader) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decodedValue = jwt.verify(token, process.env.JWT_SECRET);
    req.userID = decodedValue.id;
    // console.log(req.userID);
    next();
  } catch (e) {
    res.status(400).json({
      success: false,
      message: "Invalid token",
      error: e.message,
    });
  }
};
