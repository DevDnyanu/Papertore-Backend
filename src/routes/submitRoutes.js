const express = require("express");
const router = express.Router();
const multer = require("multer");
const mongoose = require("mongoose");
const DocumentModel = require("../models/DocumentModel");  // Ensure this path is correct

// Configure multer for file upload
const storage = multer.memoryStorage();  // Store files in memory (for MongoDB)
const upload = multer({ storage: storage });

// POST route to handle data submission (with file upload)
router.post("/submit", upload.single("file"), async (req, res) => {
  // Log the request body and file info for debugging
  console.log("Request Body:", req.body);
  console.log("Uploaded File:", req.file);

  const { name, username, number, language, billingAddress, cardNumber, expiryDate, cvv } = req.body;

  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const file = req.file;  // The uploaded file

  // Create the document object to save in MongoDB
  const newDocument = new DocumentModel({
    name,
    username,
    number,
    language,
    billingAddress,
    cardNumber,
    expiryDate,
   
    fileInfo: {
      name: file.originalname,  // File name
      size: file.size,          // File size
      data: file.buffer,        // Store file content in MongoDB
    },
  });

  try {
    // Save the document to the database
    await newDocument.save();
    res.status(200).send("Data saved successfully!");
    console.log("Data saved:", newDocument);
  } catch (err) {
    console.error("Error saving data:", err);
    res.status(500).send("Error saving data: " + err.message);
  }
}); router.delete('/api/files/:id', async (req, res) => {
  const documentId = req.params.id; // Extract documentId from the URL

  try {
    // Try to find the document in the database
    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // If document is found, delete it
    await document.remove();
    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting document' });
  }
});

module.exports = router;
