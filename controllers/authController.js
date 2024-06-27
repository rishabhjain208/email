const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const zod = require("zod");
const User = require("../models/User");
const registerBody = zod.object({
  email: zod.string().email(),
  name: zod.string(),
  password: zod.string().min(6),
});

module.exports.register = async (req, res) => {
  try {
    const result = registerBody.safeParse(req.body);
    if (!result.success) {
      return res.status(411).json({
        message: " Incorrect inputs",
      });
    }

    const { email, name } = result.data;

    const already_user = await User.findOne({ email });

    if (already_user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);

    const user = new User({
      email,
      name,
      password: hashedPassword,
    });

    const create_user = await user.save();

    const token = jwt.sign({ id: create_user._id }, process.env.JWT_SECRET);
    return res.status(200).json({
      success: true,
      message: "User created successfully",
      token: token,
    });
  } catch (e) {
    return res.status(400).json({
      success: false,
      message: "Error creating user",
      error: e.message,
    });
  }
};

const loginBody = zod.object({
  email: zod.string().email(),
  password: zod.string(),
});

module.exports.login = async (req, res) => {
  try {
    const result = loginBody.safeParse(req.body);
    if (!result.success) {
      return res.status(411).json({
        message: "Email already taken / Incorrect inputs",
      });
    }

    const { email, password } = result.data;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatchPassword = await bcrypt.compare(password, user.password);
    if (!isMatchPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token: token,
    });
  } catch (e) {
    return res.status(400).json({
      success: false,
      message: "Error logging in",
      error: e.message,
    });
  }
};
