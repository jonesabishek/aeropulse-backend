const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  turbineId: { type: String, required: true },
  turbineName: { type: String, required: true },
  severity: { type: String, enum: ['INFO', 'WARNING', 'CRITICAL'], default: 'INFO' },
  code: { type: String, required: true },
  message: { type: String, required: true },
  parameter: { type: String },
  value: { type: Number },
  threshold: { type: Number },
  status: { type: String, enum: ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'], default: 'ACTIVE' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
