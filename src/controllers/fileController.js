const DocumentModel = require("../models/DocumentModel");

// Upload File and Save Metadata to MongoDB
const uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    // Save the file metadata to MongoDB
    const newDocument = new DocumentModel({
      name: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      type: req.file.mimetype,
    });

    await newDocument.save();

    res.status(200).json({
      message: "File uploaded and saved successfully!",
      file: req.file, // Return file details in the response
    });
  } catch (error) {
    console.error("Error saving file data:", error);
    res.status(500).send("Error saving file data.");
  }
};

// Get All Files from MongoDB
const getFiles = async (req, res) => {
  try {
    const files = await DocumentModel.find(); // Fetch all documents
    res.status(200).json(files); // Send them as JSON
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ message: "Failed to retrieve files", error });
  }
};

module.exports = {
  uploadFile,
  getFiles,
};
