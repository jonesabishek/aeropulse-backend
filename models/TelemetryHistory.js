const mongoose = require('mongoose');

const telemetryHistorySchema = new mongoose.Schema({
  turbineId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  activePower: { type: Number, required: true },
  windSpeed: { type: Number, required: true },
  rotorSpeed: { type: Number, required: true },
  generatorTemp: { type: Number, required: true },
  gearboxVibration: { type: Number, required: true },
  efficiency: { type: Number, required: true }
});

module.exports = mongoose.model('TelemetryHistory', telemetryHistorySchema);
