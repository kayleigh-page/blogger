const express = require("express");
const multer = require("multer");
const path = require("path");
const axios = require("axios");

require("dotenv").config();

const router = express.Router();

// Set up storage folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.post("/uploadImage", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: 0, message: "No file uploaded" });
  }

  const baseUrl = process.env.PUBLIC_IMAGE_URL || "http://localhost:5001";
  const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

  return res.status(200).json({
    success: 1,
    file: {
      url: fileUrl,
    },
  });
});

module.exports = router;
