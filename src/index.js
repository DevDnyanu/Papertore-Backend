const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const fileRoutes = require("./routes/fileRoutes");
const submitRoutes = require("./routes/submitRoutes");
const authRoutes = require("./routes/authRoutes");
require("dotenv").config();

// Create uploads folder if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const app = express();
const port = process.env.PORT || 5000;

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Enable CORS for frontend
app.use(cors());

// Body parser middleware (for handling JSON and URL encoded data)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve files from the "uploads" folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Import routes
app.use("/api", fileRoutes);
app.use("/api", submitRoutes);
app.use("/api/auth", authRoutes);



// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
