const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderRef: {
    type: String,
    required: true,
    unique: true,
  },
  method: {
    type: String,
    enum: ['Easypaisa', 'Jazzcash', 'BankTransfer', 'Cash'],
    default: 'Easypaisa',
  },
  amount: {
    type: Number,
    required: true,
  },
  proofImage: {
    type: String, // URL or filepath of uploaded image
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Payment', paymentSchema);
