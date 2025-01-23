const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoute = require("./routes/user.route");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const ShortUrlModel = require("./models/shortUrl.model");
const device = require("express-device");
const UAParser = require("ua-parser-js");
dotenv.config();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(device.capture());
app.use(cookieParser());
app.use("/api/user", userRoute);
app.get("/", (req, res) => {
  res.send("hello");
});

app.get("/:shortId", async (req, res) => {
  const shortId = req.params.shortId;

  // Extract the required data
  const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress; // IP address of the user
  const deviceType = req.device.type; // Device type, e.g., "desktop" or "mobile"
  const userAgent = req.headers["user-agent"];
  const parser = new UAParser();
  const result = parser.setUA(userAgent).getResult();
  const os = result.os.name;

  // Proceed with your other logic here
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

  // Redirect to the original URL
  res.redirect(entry.redirectURL);
});

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.listen(PORT, () => {
  console.log("server started on port :", PORT);
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log("db connected");
    })
    .catch((err) => {
      console.log(err);
    });
});
