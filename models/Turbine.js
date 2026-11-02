const mongoose = require('mongoose');

const turbineSchema = new mongoose.Schema({
  turbineId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  farmLocation: { type: String, required: true },
  latitude: { type: Number, default: 35.12 },
  longitude: { type: Number, default: -118.25 },
  modelType: { type: String, default: 'AeroVane 3.5MW' },
  ratedCapacity: { type: Number, default: 3.5 }, // MW
  status: {
    type: String,
    enum: ['OPTIMAL', 'WARNING', 'CRITICAL', 'MAINTENANCE', 'OFFLINE'],
    default: 'OPTIMAL'
  },
  controlMode: {
    type: String,
    enum: ['AUTO', 'MANUAL', 'EMERGENCY_STOP', 'MAINTENANCE_LOCK'],
    default: 'AUTO'
  },
  telemetry: {
    windSpeed: { type: Number, default: 10.5 }, // m/s
    rotorSpeed: { type: Number, default: 14.2 }, // RPM
    pitchAngle: { type: Number, default: 2.1 }, // degrees
    yawAngle: { type: Number, default: 184.0 }, // degrees
    activePower: { type: Number, default: 2850 }, // kW
    reactivePower: { type: Number, default: 120 }, // kVAR
    generatorTemp: { type: Number, default: 62.4 }, // °C
    gearboxVibration: { type: Number, default: 1.8 }, // mm/s RMS
    bearingTemp: { type: Number, default: 58.1 }, // °C
    oilPressure: { type: Number, default: 4.2 }, // bar
    gridFrequency: { type: Number, default: 60.01 }, // Hz
    efficiency: { type: Number, default: 94.5 }, // %
    ambientTemp: { type: Number, default: 22.0 } // °C
  },
  healthScore: { type: Number, default: 96 }, // 0 - 100%
  remainingUsefulLife: {
    gearboxDays: { type: Number, default: 450 },
    generatorDays: { type: Number, default: 620 },
    rotorDays: { type: Number, default: 890 },
    pitchDays: { type: Number, default: 310 }
  },
  totalEnergyGenerated: { type: Number, default: 14250 }, // MWh cumulative
  lastMaintenance: { type: Date, default: () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  nextScheduledMaintenance: { type: Date, default: () => new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) }
}, { timestamps: true });

module.exports = mongoose.model('Turbine', turbineSchema);
