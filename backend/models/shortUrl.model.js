const mongoose = require("mongoose");

const shortUrlSchema = new mongoose.Schema(
  {
    shortId: {
      type: String,
      unique: true,
      required: true,
    },
    redirectURL: {
      type: String,
      required: true,
    },
    clicks: [
      {
        timestamp: { type: Date },
        ipAddress: { type: String }, // IP address of the user
        device: { type: String }, // e.g., Mobile, Desktop
        os: { type: String }, // e.g., iOS, Windows, Android
        browser: { type: String }, // Browser name
        browserVersion: { type: String }, // Browser version
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    remarks: {
      type: String,
      required: true,
    },
    expirationdate: {
      type: Date,
    },
  },
  { timestamps: true }
);

const ShortUrlModel = mongoose.model("shortUrl", shortUrlSchema);
module.exports = ShortUrlModel;
