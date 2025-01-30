const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoute = require("./routes/user.route");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const device = require("express-device");
dotenv.config();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(device.capture());
app.use(cookieParser());
app.use("/api/user", userRoute);
app.get("/", (req, res) => {
  res.send("hello");
});
app.set("trust proxy", true);
app.use(express.json());
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
