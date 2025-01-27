const express = require("express");
const multer = require("multer");
const path = require("path");
const fileController = require("../controllers/fileController");

const router = express.Router();

// Set storage options for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Folder where files will be saved
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
  },
});

// Set file filter for only PDF and Word documents
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|docx|doc/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true); // Allow the file
  } else {
    cb(new Error("Only PDF or Word documents are allowed.")); // Reject the file
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
});

router.post("/upload", upload.single("file"), fileController.uploadFile);
router.get("/files", fileController.getFiles);

module.exports = router;
