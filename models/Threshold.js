const mongoose = require('mongoose');

const thresholdSchema = new mongoose.Schema({
  configName: { type: String, default: 'Default Wind Farm Profile', unique: true },
  vibrationWarning: { type: Number, default: 3.0 }, // mm/s
  vibrationCritical: { type: Number, default: 4.5 }, // mm/s
  generatorTempWarning: { type: Number, default: 75.0 }, // °C
  generatorTempCritical: { type: Number, default: 85.0 }, // °C
  bearingTempWarning: { type: Number, default: 70.0 }, // °C
  bearingTempCritical: { type: Number, default: 85.0 }, // °C
  oilPressureMin: { type: Number, default: 2.5 }, // bar
  cutInWindSpeed: { type: Number, default: 3.0 }, // m/s
  cutOutWindSpeed: { type: Number, default: 25.0 }, // m/s
  updatedBy: { type: String, default: 'System Admin' },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Threshold', thresholdSchema);
