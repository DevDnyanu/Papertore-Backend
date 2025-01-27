const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  number: { type: String, required: true },
  language: { type: String, required: true },
  billingAddress: { type: String, required: true },
  cardNumber: { type: String, required: true },
  expiryDate: { type: String, required: true },
  fileInfo: {
    name: { type: String, required: false },
  },
});

module.exports = mongoose.model("Document", DocumentSchema);
