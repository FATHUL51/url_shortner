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
const mongoose = require("mongoose");

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
  const { originalLink, remark, expirationdate } = req.body;
  const shortID = shortid();

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!originalLink) {
      return res.status(400).json({ message: "Original URL is required" });
    }

    if (!remark) {
      return res.status(400).json({ message: "Remarks are required" });
    }

    const shortURL = await ShortUrlModel.create({
      shortId: shortID,
      redirectURL: originalLink,
      user: user._id,
      remarks: remark,
      expirationdate: expirationdate ? new Date(expirationdate) : null,
    });

    res.status(201).json({
      message: "Short URL created successfully",
      id: shortID,
      redirectURL: originalLink,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.put("/url/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { originalLink, remark, expirationdate } = req.body;

  try {
    // Find the short URL by its ID and ensure it belongs to the authenticated user
    const shortURL = await ShortUrlModel.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!shortURL) {
      return res
        .status(404)
        .json({ message: "Short URL not found or unauthorized" });
    }

    // Update fields if provided
    if (originalLink) {
      shortURL.redirectURL = originalLink;
    }

    if (remark) {
      shortURL.remarks = remark;
    }

    if (expirationdate) {
      shortURL.expirationdate = new Date(expirationdate);
    } else if (expirationdate === null) {
      shortURL.expirationdate = null; // Allow removing expiration date
    }

    // Save the updated short URL
    await shortURL.save();

    res.status(200).json({
      message: "Short URL updated successfully",
      data: shortURL,
    });
  } catch (error) {
    console.error("Error updating short URL:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.delete("/url/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const shortURL = await ShortUrlModel.findOneAndDelete({
      _id: id,
      user: req.user.id, // Ensure the URL belongs to the authenticated user
    });

    if (!shortURL) {
      return res
        .status(404)
        .json({ message: "Short URL not found or unauthorized" });
    }

    res.status(200).json({ message: "Short URL deleted successfully" });
  } catch (error) {
    console.error("Error deleting short URL:", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

router.get("/url", authMiddleware, async (req, res) => {
  try {
    // Extract page and limit from the query parameters
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 8; // Default to 10 results per page
    const skip = (page - 1) * limit; // Calculate how many records to skip

    // Fetch the total count of short URLs for pagination
    const totalCount = await ShortUrlModel.countDocuments({
      user: req.user.id,
    });

    // Fetch the paginated short URLs associated with the authenticated user
    const shortUrls = await ShortUrlModel.find({ user: req.user.id })
      .skip(skip)
      .limit(limit);

    if (!shortUrls || shortUrls.length === 0) {
      return res
        .status(404)
        .json({ message: "No short URLs found for this user" });
    }

    // Return paginated data with total count for the front-end
    res.status(200).json({
      message: "User short URLs fetched successfully",
      data: shortUrls,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit), // Calculate the total number of pages
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

router.get("/clicks", authMiddleware, async (req, res) => {
  const { page = 1, limit = 8 } = req.query; // Default page 1, limit 8
  const userId = req.user.id;

  try {
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch user's short URLs
    const shortUrls = await ShortUrlModel.find({ user: userId });

    // Flatten clicks with relevant details (timestamp, IP, etc.)
    const allClicks = shortUrls.flatMap((shortUrl) =>
      shortUrl.clicks.map((click) => ({
        shortId: shortUrl.shortId,
        redirectURL: shortUrl.redirectURL,
        timestamp: click.timestamp,
        ipAddress: click.ipAddress,
        device: click.device,
        os: click.os,
      }))
    );

    // Sort clicks by timestamp (newest first)
    const sortedClicks = allClicks.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    // Pagination: Slice clicks based on current page and limit
    const totalClicks = sortedClicks.length;
    const totalPages = Math.ceil(totalClicks / limit); // Total pages based on clicks
    const clicksPage = sortedClicks.slice((page - 1) * limit, page * limit); // Paginated data

    // Send the response
    res.status(200).json({
      message: "Clicks fetched successfully.",
      data: {
        clicks: clicksPage, // Paginated clicks data
        pagination: {
          totalClicks, // Total number of clicks
          currentPage: parseInt(page), // Current page
          totalPages, // Total pages
        },
      },
    });
  } catch (err) {
    console.error("Error fetching clicks:", err);
    res.status(500).json({
      error: "An error occurred while fetching clicks. Please try again.",
    });
  }
});

router.get("/:shortId", async (req, res) => {
  const shortId = req.params.shortId;

  try {
    const entry = await ShortUrlModel.findOne({ shortId });

    if (!entry) {
      return res.status(404).json({ message: "Short URL not found" });
    }

    // Check if the link has expired
    if (entry.expirationdate && new Date(entry.expirationdate) < new Date()) {
      return res.status(410).json({ message: "This link has expired :( ." });
    }

    // Log the click details (IP address, device type, etc.)
    const ipAddress = req.headers["x-forwarded-for"]
      ? req.headers["x-forwarded-for"].split(",")[0].trim()
      : req.ip;
    const deviceType = req.device.type;
    const userAgent = req.headers["user-agent"];
    const parser = new UAParser();
    const result = parser.setUA(userAgent).getResult();
    const os = result.os.name;

    // Update clicks
    await ShortUrlModel.findOneAndUpdate(
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

    // Redirect to the original URL
    res.redirect(entry.redirectURL);
  } catch (error) {
    console.error("Error in redirect route:", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
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

router.get("/", authMiddleware, async (req, res) => {
  const { query } = req.query;

  try {
    if (!query || query.trim() === "") {
      console.log("Query is missing or empty");
      return res.status(400).json({ message: "Search query is required" });
    }

    const filter = {
      user: req.user.id,
      remarks: { $regex: query, $options: "i" }, // Perform regex search
    };

    const results = await ShortUrlModel.find(filter);

    if (results.length === 0) {
      return res.status(404).json({ message: "No matching links found" });
    }

    res.status(200).json({
      message: "Search results fetched successfully",
      data: results,
    });
  } catch (error) {
    console.error("Error in /search route:", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;
