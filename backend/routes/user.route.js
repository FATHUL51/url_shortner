const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const User = require("../models/user.model");
const ShortUrlModel = require("../models/shortUrl.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { header } = require("express-validator");
const shortid = require("shortid");
const device = require("express-device");
const UAParser = require("ua-parser-js");

dotenv.config();
router.use(express.json());

// Register a new user
router.post("/register", async (req, res) => {
  const { username, email, mobile, password } = req.body;

  try {
    const isUserExists = await User.findOne({ email });
    if (isUserExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      username,
      email,
      mobile,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: `${error}` });
  }
});

// GET /user route to fetch user profile details
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // Exclude password from the response
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User profile fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// User login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Secure cookie options
    res.cookie("token", token);

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/url", authMiddleware, async (req, res) => {
  const { orignalLink, remarks, expirationdate, device } = req.body; // Include remarks and expirationdate
  const ipAddress = req.ip || req.headers["x-forwarded-for"] || "Unknown";
  const shortID = shortid();

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!orignalLink) {
      return res.status(400).json({ message: "Original URL is required" });
    }

    if (!remarks) {
      return res.status(400).json({ message: "Remarks are required" });
    }

    // Ensure the device object exists and has the necessary properties
    const deviceInfo = device
      ? {
          device: device.deviceType || "Unknown",
          os: device.os || "Unknown",
          browser: device.browserName || "Unknown",
          browserVersion: device.browserVersion || "Unknown",
        }
      : {
          device: "Unknown",
          os: "Unknown",
          browser: "Unknown",
          browserVersion: "Unknown",
        };

    // Create the short URL with remarks and expiration date
    const shortURL = await ShortUrlModel.create({
      shortId: shortID,
      redirectURL: orignalLink,
      user: user,
      remarks: remarks,
      expirationdate: expirationdate || null, // If no expiration date, set to null
      clicks: [], // Initially no clicks
    });

    // Log the click details for the first click (optional)
    shortURL.clicks.push({
      timestamp: Date.now(),
      ipAddress: ipAddress,
      ...deviceInfo,
    });

    // Save the short URL with the click information
    await shortURL.save();

    res.status(201).json({
      message: "Short URL created successfully",
      id: shortID,
      redirectURL: orignalLink,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.get("/url", authMiddleware, async (req, res) => {
  try {
    // Fetch all short URLs associated with the authenticated user
    const shortUrls = await ShortUrlModel.find({ user: req.user.id });

    if (!shortUrls || shortUrls.length === 0) {
      return res
        .status(404)
        .json({ message: "No short URLs found for this user" });
    }

    // Return the raw data without using map
    res.status(200).json({
      message: "User short URLs fetched successfully",
      data: shortUrls,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

router.get("/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const ipAddress = req.ip;
  const deviceType = req.device.type;
  const userAgent = req.headers["user-agent"];
  const parser = new UAParser();
  const result = parser.setUA(userAgent).getResult();
  const os = result.os.name;

  const entry = await ShortUrlModel.findOneAndUpdate(
    { shortId },
    {
      $push: {
        clicks: {
          timestamp: Date.now(),
          ipAddress: ipAddress,
          device: deviceType,
          os: os,
        },
      },
    },
    { new: true }
  );

  if (!entry) {
    return res.status(404).json({ message: "Short URL not found" });
  }

  res.redirect(entry.redirectURL);
});

router.delete("/delete", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await ShortUrlModel.deleteMany({ user: req.user.id });
    res
      .status(200)
      .json({ message: "User and related data deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

router.put("/update", authMiddleware, async (req, res) => {
  const { username, email, mobile } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (username) user.username = username;
    if (email) user.email = email;
    if (mobile) user.mobile = mobile;
    await user.save();
    res
      .status(200)
      .json({ message: "User information updated successfully", data: user });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});
module.exports = router;
