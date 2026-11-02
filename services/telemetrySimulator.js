// Real-time Wind Turbine Physics & Telemetry Engine with MongoDB Sync
const Turbine = require('../models/Turbine');
const Alert = require('../models/Alert');
const WorkOrder = require('../models/WorkOrder');
const TelemetryHistory = require('../models/TelemetryHistory');
const Threshold = require('../models/Threshold');

const initialTurbinesData = [
  // --- Zone 1: Zephyr Valley (Onshore Valley Farm) ---
  {
    turbineId: 'T-101',
    name: 'Zephyr Alpha-1',
    farmLocation: 'Zephyr Valley',
    latitude: 35.120,
    longitude: -118.250,
    modelType: 'AeroVane 3.5MW',
    ratedCapacity: 3.5,
    status: 'OPTIMAL',
    controlMode: 'AUTO',
    healthScore: 98,
    telemetry: {
      windSpeed: 11.2,
      rotorSpeed: 15.1,
      pitchAngle: 2.1,
      yawAngle: 184.5,
      activePower: 3120,
      reactivePower: 140,
      generatorTemp: 64.2,
      gearboxVibration: 1.4,
      bearingTemp: 56.8,
      oilPressure: 4.3,
      gridFrequency: 60.01,
      efficiency: 95.2,
      ambientTemp: 23.5
    },
    remainingUsefulLife: { gearboxDays: 480, generatorDays: 650, rotorDays: 920, pitchDays: 340 },
    totalEnergyGenerated: 18420,
    lastMaintenance: new Date(Date.now() - 25 * 86400000),
    nextScheduledMaintenance: new Date(Date.now() + 65 * 86400000)
  },
  {
    turbineId: 'T-102',
    name: 'Zephyr Beta-2',
    farmLocation: 'Zephyr Valley',
    latitude: 35.125,
    longitude: -118.258,
    modelType: 'AeroVane 3.5MW',
    ratedCapacity: 3.5,
    status: 'WARNING',
    controlMode: 'AUTO',
    healthScore: 74,
    telemetry: {
      windSpeed: 11.8,
      rotorSpeed: 15.6,
      pitchAngle: 3.4,
      yawAngle: 188.0,
      activePower: 2980,
      reactivePower: 180,
      generatorTemp: 81.5,
      gearboxVibration: 3.8,
      bearingTemp: 74.2,
      oilPressure: 3.1,
      gridFrequency: 59.98,
      efficiency: 86.4,
      ambientTemp: 23.5
    },
    remainingUsefulLife: { gearboxDays: 42, generatorDays: 180, rotorDays: 710, pitchDays: 210 },
    totalEnergyGenerated: 16950,
    lastMaintenance: new Date(Date.now() - 110 * 86400000),
    nextScheduledMaintenance: new Date(Date.now() + 5 * 86400000)
  },
  {
    turbineId: 'T-103',
    name: 'Zephyr Gamma-3',
    farmLocation: 'Zephyr Valley',
    latitude: 35.131,
    longitude: -118.242,
    modelType: 'AeroVane 3.5MW',
    ratedCapacity: 3.5,
    status: 'OPTIMAL',
    controlMode: 'AUTO',
    healthScore: 94,
    telemetry: {
      windSpeed: 10.9,
      rotorSpeed: 14.8,
      pitchAngle: 1.8,
      yawAngle: 183.2,
      activePower: 2890,
      reactivePower: 130,
      generatorTemp: 61.0,
      gearboxVibration: 1.6,
      bearingTemp: 54.1,
      oilPressure: 4.4,
      gridFrequency: 60.02,
      efficiency: 94.8,
      ambientTemp: 23.5
    },
    remainingUsefulLife: { gearboxDays: 520, generatorDays: 710, rotorDays: 980, pitchDays: 410 },
    totalEnergyGenerated: 19100,
    lastMaintenance: new Date(Date.now() - 15 * 86400000),
    nextScheduledMaintenance: new Date(Date.now() + 75 * 86400000)
  },
  {
    turbineId: 'T-104',
    name: 'Zephyr Delta-4',
    farmLocation: 'Zephyr Valley',
    latitude: 35.138,
    longitude: -118.235,
    modelType: 'AeroVane 3.5MW',
    ratedCapacity: 3.5,
    status: 'OPTIMAL',
    controlMode: 'AUTO',
    healthScore: 99,
    telemetry: {
      windSpeed: 11.6,
      rotorSpeed: 15.3,
      pitchAngle: 2.0,
      yawAngle: 185.0,
      activePower: 3210,
      reactivePower: 135,
      generatorTemp: 59.8,
      gearboxVibration: 1.2,
      bearingTemp: 53.0,
      oilPressure: 4.5,
      gridFrequency: 60.00,
      efficiency: 96.8,
      ambientTemp: 23.0
    },
    remainingUsefulLife: { gearboxDays: 620, generatorDays: 780, rotorDays: 1050, pitchDays: 460 },
    totalEnergyGenerated: 17800,
    lastMaintenance: new Date(Date.now() - 8 * 86400000),
    nextScheduledMaintenance: new Date(Date.now() + 82 * 86400000)
  },

  // --- Zone 2: High Desert Ridge (High-Altitude Mountain Farm) ---
  {
    turbineId: 'T-201',
    name: 'Ridge Titan-1',
    farmLocation: 'High Desert Ridge',
    latitude: 34.850,
    longitude: -117.910,
    modelType: 'VortexX 4.2MW',
    ratedCapacity: 4.2,
    status: 'OPTIMAL',
    controlMode: 'AUTO',
    healthScore: 97,
    telemetry: {
      windSpeed: 12.5,
      rotorSpeed: 16.2,
      pitchAngle: 4.1,
      yawAngle: 210.0,
      activePower: 4100,
      reactivePower: 210,
      generatorTemp: 66.8,
      gearboxVibration: 1.9,
      bearingTemp: 59.4,
      oilPressure: 4.5,
      gridFrequency: 60.00,
      efficiency: 96.1,
      ambientTemp: 28.0
    },
    remainingUsefulLife: { gearboxDays: 610, generatorDays: 820, rotorDays: 1100, pitchDays: 490 },
    totalEnergyGenerated: 24500,
    lastMaintenance: new Date(Date.now() - 40 * 86400000),
    nextScheduledMaintenance: new Date(Date.now() + 50 * 86400000)
  },
  {
    turbineId: 'T-202',
    name: 'Ridge Titan-2',
    farmLocation: 'High Desert Ridge',
    latitude: 34.856,
    longitude: -117.902,
    modelType: 'VortexX 4.2MW',
    ratedCapacity: 4.2,
    status: 'CRITICAL',
    controlMode: 'AUTO',
    healthScore: 48,
    telemetry: {
      windSpeed: 12.8,
      rotorSpeed: 16.5,
      pitchAngle: 5.0,
      yawAngle: 212.5,
      activePower: 3450,
      reactivePower: 290,
      generatorTemp: 92.4,
      gearboxVibration: 6.2,
      bearingTemp: 88.1,
      oilPressure: 2.2,
      gridFrequency: 59.94,
      efficiency: 78.2,
      ambientTemp: 28.0
    },
    remainingUsefulLife: { gearboxDays: 8, generatorDays: 35, rotorDays: 450, pitchDays: 120 },
    totalEnergyGenerated: 22100,
    lastMaintenance: new Date(Date.now() - 180 * 86400000),
    nextScheduledMaintenance: new Date(Date.now() + 2 * 86400000)
  },
  {
    turbineId: 'T-203',
    name: 'Ridge Titan-3',
    farmLocation: 'High Desert Ridge',
    latitude: 34.862,
    longitude: -117.895,
    modelType: 'VortexX 4.2MW',
    ratedCapacity: 4.2,
    status: 'MAINTENANCE',
    controlMode: 'MAINTENANCE_LOCK',
    healthScore: 65,
    telemetry: {
      windSpeed: 12.1,
      rotorSpeed: 0.0,
      pitchAngle: 90.0,
      yawAngle: 210.0,
      activePower: 0,
      reactivePower: 0,
      generatorTemp: 32.0,
      gearboxVibration: 0.1,
      bearingTemp: 31.5,
      oilPressure: 0.0,
      gridFrequency: 60.00,
      efficiency: 0.0,
      ambientTemp: 28.0
    },
    remainingUsefulLife: { gearboxDays: 15, generatorDays: 240, rotorDays: 800, pitchDays: 180 },
    totalEnergyGenerated: 21050,
    lastMaintenance: new Date(Date.now() - 2 * 86400000),
    nextScheduledMaintenance: new Date(Date.now() + 1 * 86400000)
  },
  {
    turbineId: 'T-204',
    name: 'Ridge Titan-4',
    farmLocation: 'High Desert Ridge',
    latitude: 34.868,
    longitude: -117.888,
    modelType: 'VortexX 4.2MW',
    ratedCapacity: 4.2,
    status: 'OPTIMAL',
    controlMode: 'AUTO',
    healthScore: 95,
    telemetry: {
      windSpeed: 12.2,
      rotorSpeed: 16.0,
      pitchAngle: 3.8,
      yawAngle: 209.0,
      activePower: 3980,
      reactivePower: 195,
      generatorTemp: 68.2,
      gearboxVibration: 1.7,
      bearingTemp: 60.5,
      oilPressure: 4.4,
      gridFrequency: 60.01,
      efficiency: 95.8,
      ambientTemp: 27.5
    },
    remainingUsefulLife: { gearboxDays: 590, generatorDays: 790, rotorDays: 1080, pitchDays: 450 },
    totalEnergyGenerated: 23600,
    lastMaintenance: new Date(Date.now() - 32 * 86400000),
    nextScheduledMaintenance: new Date(Date.now() + 58 * 86400000)
  },

  // --- Zone 3: Offshore Boreas Bay (Deepwater Offshore Farm) ---
  {
    turbineId: 'T-301',
    name: 'Oceanus Neptune-1',
    farmLocation: 'Offshore Boreas Bay',
    latitude: 54.210,
    longitude: 6.850,
    modelType: 'Poseidon 5.0MW Offshore',
    ratedCapacity: 5.0,
    status: 'OPTIMAL',
    controlMode: 'AUTO',
    healthScore: 99,
    telemetry: {
      windSpeed: 14.2,
      rotorSpeed: 18.0,
      pitchAngle: 6.2,
      yawAngle: 315.0,
      activePower: 4950,
      reactivePower: 250,
      generatorTemp: 59.2,
      gearboxVibration: 1.2,
      bearingTemp: 52.4,
      oilPressure: 4.8,
      gridFrequency: 60.01,
      efficiency: 97.4,
      ambientTemp: 16.0
    },
    remainingUsefulLife: { gearboxDays: 750, generatorDays: 920, rotorDays: 1250, pitchDays: 610 },
    totalEnergyGenerated: 32400,
    lastMaintenance: new Date(Date.now() - 10 * 86400000),
    nextScheduledMaintenance: new Date(Date.now() + 80 * 86400000)
  },
  {
    turbineId: 'T-302',
    name: 'Oceanus Neptune-2',
    farmLocation: 'Offshore Boreas Bay',
    latitude: 54.218,
    longitude: 6.862,
    modelType: 'Poseidon 5.0MW Offshore',
    ratedCapacity: 5.0,
    status: 'OPTIMAL',
    controlMode: 'AUTO',
    healthScore: 96,
    telemetry: {
      windSpeed: 13.9,
      rotorSpeed: 17.6,
      pitchAngle: 5.8,
      yawAngle: 312.0,
      activePower: 4820,
      reactivePower: 240,
      generatorTemp: 62.0,
      gearboxVibration: 1.5,
      bearingTemp: 55.0,
      oilPressure: 4.6,
      gridFrequency: 60.00,
      efficiency: 96.5,
      ambientTemp: 16.0
    },
    remainingUsefulLife: { gearboxDays: 680, generatorDays: 890, rotorDays: 1180, pitchDays: 580 },
    totalEnergyGenerated: 31800,
    lastMaintenance: new Date(Date.now() - 20 * 86400000),
    nextScheduledMaintenance: new Date(Date.now() + 70 * 86400000)
  },
  {
    turbineId: 'T-303',
    name: 'Oceanus Triton-3',
    farmLocation: 'Offshore Boreas Bay',
    latitude: 54.225,
    longitude: 6.875,
    modelType: 'Poseidon 6.0MW NextGen',
    ratedCapacity: 6.0,
    status: 'OPTIMAL',
    controlMode: 'AUTO',
    healthScore: 99,
    telemetry: {
      windSpeed: 14.8,
      rotorSpeed: 18.5,
      pitchAngle: 6.5,
      yawAngle: 314.5,
      activePower: 5840,
      reactivePower: 280,
      generatorTemp: 58.5,
      gearboxVibration: 1.1,
      bearingTemp: 51.0,
      oilPressure: 4.9,
      gridFrequency: 60.00,
      efficiency: 98.2,
      ambientTemp: 15.5
    },
    remainingUsefulLife: { gearboxDays: 820, generatorDays: 980, rotorDays: 1350, pitchDays: 690 },
    totalEnergyGenerated: 38200,
    lastMaintenance: new Date(Date.now() - 5 * 86400000),
    nextScheduledMaintenance: new Date(Date.now() + 85 * 86400000)
  },
  {
    turbineId: 'T-304',
    name: 'Oceanus Triton-4',
    farmLocation: 'Offshore Boreas Bay',
    latitude: 54.232,
    longitude: 6.888,
    modelType: 'Poseidon 6.0MW NextGen',
    ratedCapacity: 6.0,
    status: 'WARNING',
    controlMode: 'AUTO',
    healthScore: 78,
    telemetry: {
      windSpeed: 14.4,
      rotorSpeed: 17.8,
      pitchAngle: 5.2,
      yawAngle: 323.0,
      activePower: 5210,
      reactivePower: 310,
      generatorTemp: 76.4,
      gearboxVibration: 2.8,
      bearingTemp: 72.8,
      oilPressure: 3.4,
      gridFrequency: 59.99,
      efficiency: 89.2,
      ambientTemp: 15.8
    },
    remainingUsefulLife: { gearboxDays: 95, generatorDays: 280, rotorDays: 910, pitchDays: 240 },
    totalEnergyGenerated: 35900,
    lastMaintenance: new Date(Date.now() - 85 * 86400000),
    nextScheduledMaintenance: new Date(Date.now() + 15 * 86400000)
  }
];

const initialAlerts = [
  {
    id: 'ALT-1001',
    turbineId: 'T-202',
    turbineName: 'Ridge Titan-2',
    severity: 'CRITICAL',
    code: 'GEARBOX_VIBRATION_CRITICAL',
    message: 'Extreme mechanical vibration detected in main gearbox (6.2 mm/s). Immediate inspection required.',
    parameter: 'gearboxVibration',
    value: 6.2,
    threshold: 4.5,
    status: 'ACTIVE',
    timestamp: new Date(Date.now() - 45 * 60000)
  },
  {
    id: 'ALT-1002',
    turbineId: 'T-202',
    turbineName: 'Ridge Titan-2',
    severity: 'CRITICAL',
    code: 'GENERATOR_OVERHEAT',
    message: 'Generator stator temperature exceeded critical limit (92.4 °C). Thermal degradation risk.',
    parameter: 'generatorTemp',
    value: 92.4,
    threshold: 85.0,
    status: 'ACTIVE',
    timestamp: new Date(Date.now() - 30 * 60000)
  },
  {
    id: 'ALT-1003',
    turbineId: 'T-102',
    turbineName: 'Zephyr Beta-2',
    severity: 'WARNING',
    code: 'GEARBOX_BEARING_WEAR',
    message: 'High bearing operating temperature (74.2 °C) indicating friction wear.',
    parameter: 'bearingTemp',
    value: 74.2,
    threshold: 70.0,
    status: 'ACTIVE',
    timestamp: new Date(Date.now() - 120 * 60000)
  },
  {
    id: 'ALT-1004',
    turbineId: 'T-304',
    turbineName: 'Oceanus Triton-4',
    severity: 'WARNING',
    code: 'YAW_ALIGNMENT_DRIFT',
    message: 'Offshore nacelle yaw angle offset (8.5° from wind vector) causing aerodynamic shear loss.',
    parameter: 'yawAngle',
    value: 323.0,
    threshold: 315.0,
    status: 'ACTIVE',
    timestamp: new Date(Date.now() - 75 * 60000)
  },
  {
    id: 'ALT-1005',
    turbineId: 'T-202',
    turbineName: 'Ridge Titan-2',
    severity: 'CRITICAL',
    code: 'OIL_PRESSURE_LOW',
    message: 'Lubrication oil supply pressure dropped to 2.2 bar (Minimum threshold: 2.5 bar).',
    parameter: 'oilPressure',
    value: 2.2,
    threshold: 2.5,
    status: 'ACTIVE',
    timestamp: new Date(Date.now() - 20 * 60000)
  },
  {
    id: 'ALT-1006',
    turbineId: 'T-203',
    turbineName: 'Ridge Titan-3',
    severity: 'INFO',
    code: 'MAINTENANCE_LOCKOUT',
    message: 'Rotor lockout active: Hydraulic pitch cylinder servicing initiated.',
    parameter: 'controlMode',
    value: 90.0,
    threshold: 0,
    status: 'ACKNOWLEDGED',
    timestamp: new Date(Date.now() - 180 * 60000)
  }
];

const initialWorkOrders = [
  {
    workOrderId: 'WO-2026-041',
    turbineId: 'T-202',
    turbineName: 'Ridge Titan-2',
    title: 'Emergency Gearbox Bearing & Seal Replacement',
    description: 'Vibration anomaly AI alert triggered. Inspect planetary gear assembly and replace damaged main shaft bearing.',
    priority: 'URGENT',
    status: 'IN_PROGRESS',
    technician: 'Dr. Sarah Connor (Lead Specialist)',
    assignedDate: new Date(Date.now() - 2 * 3600000),
    dueDate: new Date(Date.now() + 24 * 3600000),
    estimatedCost: 14500,
    componentsToReplace: ['Main Shaft Bearing', 'Planetary Gear Seal', 'Synthetic Lubricant Oil'],
    notes: 'Crane dispatched to High Desert Ridge. Downtime scheduled for 8 hours.'
  },
  {
    workOrderId: 'WO-2026-039',
    turbineId: 'T-203',
    turbineName: 'Ridge Titan-3',
    title: 'Scheduled 5000-Hour Hydraulic System Overhaul',
    description: 'Routine maintenance lock enabled for pitch cylinder replacement and hydraulic valve calibration.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    technician: 'Marcus Chen',
    assignedDate: new Date(Date.now() - 14 * 3600000),
    dueDate: new Date(Date.now() + 10 * 3600000),
    estimatedCost: 4800,
    componentsToReplace: ['Hydraulic Filter', 'Pitch Actuation Valve'],
    notes: 'Unit currently in locked pitch mode.'
  },
  {
    workOrderId: 'WO-2026-035',
    turbineId: 'T-102',
    turbineName: 'Zephyr Beta-2',
    title: 'Gearbox Oil Flush & Thermal Sensor Replacement',
    description: 'Inspect cooling fan radiator and replace degraded oil filter.',
    priority: 'MEDIUM',
    status: 'PENDING',
    technician: 'Dr. Sarah Connor',
    assignedDate: new Date(Date.now() - 24 * 3600000),
    dueDate: new Date(Date.now() + 48 * 3600000),
    estimatedCost: 2900,
    componentsToReplace: ['Oil Filter', 'RTD Temp Sensor'],
    notes: 'Pending technician availability after T-202 complete.'
  },
  {
    workOrderId: 'WO-2026-033',
    turbineId: 'T-304',
    turbineName: 'Oceanus Triton-4',
    title: 'Offshore LiDAR & Yaw Slew Ring Recalibration',
    description: 'Recalibrate ultrasonic anemometer and inspect yaw drive hydraulic calipers to eliminate heading drift.',
    priority: 'HIGH',
    status: 'PENDING',
    technician: 'Alex Rivera',
    assignedDate: new Date(Date.now() - 6 * 3600000),
    dueDate: new Date(Date.now() + 72 * 3600000),
    estimatedCost: 6200,
    componentsToReplace: ['Nacelle LiDAR Resolver', 'Yaw Brake Caliper Pads'],
    notes: 'Support vessel scheduled for offshore transport on Thursday.'
  },
  {
    workOrderId: 'WO-2026-028',
    turbineId: 'T-301',
    turbineName: 'Oceanus Neptune-1',
    title: 'Subsea Inter-Array Cable Insulation Resistance Audit',
    description: 'Periodic dielectric spectroscopy and time-domain reflectometry of 33kV offshore array cable.',
    priority: 'LOW',
    status: 'COMPLETED',
    technician: 'Dr. Sarah Connor',
    assignedDate: new Date(Date.now() - 120 * 3600000),
    dueDate: new Date(Date.now() - 24 * 3600000),
    estimatedCost: 3100,
    componentsToReplace: ['Cable Bushing Seal Kit'],
    notes: 'Test completed successfully. Insulation impedance measured at 4.2 Giga-ohms (nominal).'
  },
  {
    workOrderId: 'WO-2026-022',
    turbineId: 'T-101',
    turbineName: 'Zephyr Alpha-1',
    title: 'Annual Blade Leading-Edge Inspection & UV Resurfacing',
    description: 'Rope-access blade inspection with ultrasonic thickness gauge and polyurethane erosion tape repair.',
    priority: 'LOW',
    status: 'COMPLETED',
    technician: 'Marcus Chen',
    assignedDate: new Date(Date.now() - 240 * 3600000),
    dueDate: new Date(Date.now() - 96 * 3600000),
    estimatedCost: 1850,
    componentsToReplace: ['Polyurethane Leading Edge Tape', 'Epoxy UV Gelcoat'],
    notes: 'Blades A, B, and C inspected. Minor micro-pitting filled and cured.'
  }
];

class TelemetryStore {
  constructor() {
    this.turbines = JSON.parse(JSON.stringify(initialTurbinesData));
    this.alerts = JSON.parse(JSON.stringify(initialAlerts));
    this.workOrders = JSON.parse(JSON.stringify(initialWorkOrders));
    this.historyMap = new Map();
    this.globalWeatherModifier = { windSpeedOffset: 0, tempOffset: 0 };
    this.io = null;
    this.stepCounter = 0;
    this.lastTickAt = new Date().toISOString();

    // Configurable Alert & Sensor Thresholds (Admin Controlled)
    this.thresholds = {
      vibrationWarning: 3.0,
      vibrationCritical: 4.5,
      generatorTempWarning: 75.0,
      generatorTempCritical: 85.0,
      bearingTempWarning: 70.0,
      bearingTempCritical: 85.0,
      oilPressureMin: 2.5,
      cutInWindSpeed: 3.0,
      cutOutWindSpeed: 25.0
    };
    
    // Seed initial history buffer
    const now = Date.now();
    this.turbines.forEach(t => {
      const history = [];
      for (let i = 24; i >= 0; i--) {
        const time = new Date(now - i * 3600000);
        const wind = Math.max(2, t.telemetry.windSpeed + (Math.random() - 0.5) * 3);
        const pwr = this.calculatePower(wind, t.ratedCapacity, t.status);
        history.push({
          timestamp: time.toISOString(),
          windSpeed: Number(wind.toFixed(1)),
          activePower: Math.round(pwr),
          rotorSpeed: Number((wind * 1.35).toFixed(1)),
          generatorTemp: Number((t.telemetry.generatorTemp + (Math.random() - 0.5) * 4).toFixed(1)),
          gearboxVibration: Number((t.telemetry.gearboxVibration + (Math.random() - 0.5) * 0.4).toFixed(2)),
          efficiency: Number((t.telemetry.efficiency + (Math.random() - 0.5) * 2).toFixed(1))
        });
      }
      this.historyMap.set(t.turbineId, history);
    });
  }

  setSocketIO(io) {
    this.io = io;
  }

  // Load existing documents from MongoDB into memory
  async loadFromDb() {
    try {
      const dbTurbines = await Turbine.find().lean();
      if (dbTurbines && dbTurbines.length > 0) {
        this.turbines = dbTurbines;
        console.log(`[MongoDB] Loaded ${dbTurbines.length} Turbines from Database into live store.`);
      }

      const dbAlerts = await Alert.find().sort({ timestamp: -1 }).limit(50).lean();
      if (dbAlerts && dbAlerts.length > 0) {
        this.alerts = dbAlerts.map(a => ({
          id: a._id.toString(),
          ...a
        }));
        console.log(`[MongoDB] Loaded ${dbAlerts.length} Alerts from Database into live store.`);
      }

      const dbWorkOrders = await WorkOrder.find().sort({ createdAt: -1 }).lean();
      if (dbWorkOrders && dbWorkOrders.length > 0) {
        this.workOrders = dbWorkOrders;
        console.log(`[MongoDB] Loaded ${dbWorkOrders.length} Work Orders from Database into live store.`);
      }

      // Load Threshold settings if saved
      const dbThreshold = await Threshold.findOne().lean();
      if (dbThreshold) {
        this.thresholds = {
          vibrationWarning: dbThreshold.vibrationWarning,
          vibrationCritical: dbThreshold.vibrationCritical,
          generatorTempWarning: dbThreshold.generatorTempWarning,
          generatorTempCritical: dbThreshold.generatorTempCritical,
          bearingTempWarning: dbThreshold.bearingTempWarning,
          bearingTempCritical: dbThreshold.bearingTempCritical,
          oilPressureMin: dbThreshold.oilPressureMin,
          cutInWindSpeed: dbThreshold.cutInWindSpeed,
          cutOutWindSpeed: dbThreshold.cutOutWindSpeed
        };
        console.log('[MongoDB] Loaded Custom Operational Thresholds from Database.');
      }

      // Load recent history from DB for each turbine
      for (const t of this.turbines) {
        const histDocs = await TelemetryHistory.find({ turbineId: t.turbineId })
          .sort({ timestamp: -1 })
          .limit(50)
          .lean();
        if (histDocs && histDocs.length > 0) {
          this.historyMap.set(t.turbineId, histDocs.reverse().map(h => ({
            timestamp: new Date(h.timestamp).toISOString(),
            windSpeed: h.windSpeed,
            activePower: h.activePower,
            rotorSpeed: h.rotorSpeed,
            generatorTemp: h.generatorTemp,
            gearboxVibration: h.gearboxVibration,
            efficiency: h.efficiency
          })));
        }
      }
    } catch (err) {
      console.warn('[MongoDB] Sync from DB skipped or failed:', err.message);
    }
  }

  calculatePower(windSpeed, ratedMW, status) {
    if (status === 'OFFLINE' || status === 'MAINTENANCE') return 0;
    if (windSpeed < this.thresholds.cutInWindSpeed || windSpeed > this.thresholds.cutOutWindSpeed) return 0; // Cut-in / Cut-out limits
    
    const maxKW = ratedMW * 1000;
    if (windSpeed >= 12.5) {
      return maxKW * (0.96 + Math.random() * 0.04);
    }
    // Cubic ramp curve
    const ratio = Math.pow((windSpeed - this.thresholds.cutInWindSpeed) / (12.5 - this.thresholds.cutInWindSpeed), 2.7);
    return Math.min(maxKW, maxKW * ratio);
  }

  calculateHealthScore(telemetry, status) {
    if (status === 'MAINTENANCE' || status === 'OFFLINE') return 65;
    
    let score = 100;
    // Gearbox vibration impact
    if (telemetry.gearboxVibration > this.thresholds.vibrationCritical) score -= 35;
    else if (telemetry.gearboxVibration > this.thresholds.vibrationWarning) score -= 18;
    else if (telemetry.gearboxVibration > 2.0) score -= 5;

    // Temp impact
    if (telemetry.generatorTemp > this.thresholds.generatorTempCritical) score -= 30;
    else if (telemetry.generatorTemp > this.thresholds.generatorTempWarning) score -= 15;
    
    if (telemetry.bearingTemp > this.thresholds.bearingTempCritical) score -= 20;
    else if (telemetry.bearingTemp > this.thresholds.bearingTempWarning) score -= 10;

    // Oil pressure
    if (telemetry.oilPressure < this.thresholds.oilPressureMin) score -= 25;

    return Math.max(15, Math.min(100, Math.round(score)));
  }

  updateSimulationStep() {
    const timestamp = new Date().toISOString();
    this.stepCounter++;
    this.lastTickAt = timestamp;

    this.turbines.forEach(t => {
      if (t.controlMode === 'EMERGENCY_STOP' || t.controlMode === 'MAINTENANCE_LOCK' || t.status === 'OFFLINE') {
        t.telemetry.rotorSpeed = Math.max(0, Number((t.telemetry.rotorSpeed * 0.85).toFixed(1)));
        t.telemetry.activePower = 0;
        t.telemetry.pitchAngle = 90.0;
        t.telemetry.generatorTemp = Math.max(t.telemetry.ambientTemp, Number((t.telemetry.generatorTemp - 0.5).toFixed(1)));
        t.telemetry.gearboxVibration = Number((Math.random() * 0.2).toFixed(2));
        return;
      }

      // Wind fluctuation
      const baseWind = t.telemetry.windSpeed;
      const windDelta = (Math.random() - 0.49) * 0.6 + this.globalWeatherModifier.windSpeedOffset * 0.05;
      let newWind = Math.max(1.5, Math.min(28.0, baseWind + windDelta));
      t.telemetry.windSpeed = Number(newWind.toFixed(1));

      // Cut-out auto protection check based on configured cutOutWindSpeed
      if (newWind > this.thresholds.cutOutWindSpeed) {
        t.telemetry.activePower = 0;
        t.telemetry.rotorSpeed = 2.0;
        t.telemetry.pitchAngle = 85.0; // Feather blades
        t.status = 'WARNING';
      } else {
        const pwr = this.calculatePower(newWind, t.ratedCapacity, t.status);
        t.telemetry.activePower = Math.round(pwr);
        t.telemetry.rotorSpeed = Number((newWind * 1.35 + (Math.random() - 0.5) * 0.4).toFixed(1));

        // Pitch Angle adjustment
        if (t.controlMode === 'AUTO') {
          if (newWind > 12.5) {
            t.telemetry.pitchAngle = Number(((newWind - 12.5) * 2.2 + 2.0).toFixed(1));
          } else {
            t.telemetry.pitchAngle = Number((1.5 + Math.random() * 0.8).toFixed(1));
          }
        }
      }

      // Generator & Bearing Temperature thermal simulation
      const targetGenTemp = 35 + (t.telemetry.activePower / (t.ratedCapacity * 1000)) * 40 + (t.status === 'CRITICAL' ? 22 : 0);
      const tempDelta = (targetGenTemp - t.telemetry.generatorTemp) * 0.08;
      t.telemetry.generatorTemp = Number((t.telemetry.generatorTemp + tempDelta + (Math.random() - 0.5) * 0.2).toFixed(1));
      t.telemetry.bearingTemp = Number((t.telemetry.generatorTemp * 0.88 + (t.status === 'WARNING' ? 8 : 0)).toFixed(1));

      // Gearbox vibration
      if (t.status === 'CRITICAL') {
        t.telemetry.gearboxVibration = Number((5.8 + Math.random() * 1.2).toFixed(2));
      } else if (t.status === 'WARNING') {
        t.telemetry.gearboxVibration = Number((3.4 + Math.random() * 0.8).toFixed(2));
      } else {
        t.telemetry.gearboxVibration = Number((1.2 + Math.random() * 0.6).toFixed(2));
      }

      // Calculate efficiency
      if (t.telemetry.activePower > 0) {
        const theoretical = (t.ratedCapacity * 1000) * Math.min(1.0, Math.pow(newWind / 12.5, 3));
        t.telemetry.efficiency = Number(Math.min(98.5, Math.max(60.0, (t.telemetry.activePower / Math.max(100, theoretical)) * 96)).toFixed(1));
      } else {
        t.telemetry.efficiency = 0;
      }

      // Health Score Calculation
      t.healthScore = this.calculateHealthScore(t.telemetry, t.status);

      // Remaining Useful Life decay simulation
      if (t.status === 'CRITICAL') {
        t.remainingUsefulLife.gearboxDays = Math.max(1, t.remainingUsefulLife.gearboxDays - 0.1);
      }

      // Total energy cumulative addition (MWh)
      t.totalEnergyGenerated = Number((t.totalEnergyGenerated + (t.telemetry.activePower / 3600000)).toFixed(3));

      // Update history buffer
      const history = this.historyMap.get(t.turbineId) || [];
      history.push({
        timestamp,
        windSpeed: t.telemetry.windSpeed,
        activePower: t.telemetry.activePower,
        rotorSpeed: t.telemetry.rotorSpeed,
        generatorTemp: t.telemetry.generatorTemp,
        gearboxVibration: t.telemetry.gearboxVibration,
        efficiency: t.telemetry.efficiency
      });
      if (history.length > 50) history.shift();
      this.historyMap.set(t.turbineId, history);

      // Check threshold rules for automatic AI Alerts (UML System Actor function)
      this.checkAlertConditions(t);
    });

    // Bulk-persist to MongoDB every 4 steps (~6 seconds)
    if (this.stepCounter % 4 === 0) {
      this.syncTurbinesToMongoDB();
    }

    // Persist historical snapshot to MongoDB every 20 steps (~30 seconds)
    if (this.stepCounter % 20 === 0) {
      this.persistHistorySnapshotToMongoDB(timestamp);
    }

    if (this.io) {
      this.io.emit('telemetry_update', {
        timestamp,
        turbines: this.turbines,
        summary: this.getSummaryStats()
      });
    }
  }

  async syncTurbinesToMongoDB() {
    try {
      const ops = this.turbines.map(t => ({
        updateOne: {
          filter: { turbineId: t.turbineId },
          update: {
            $set: {
              status: t.status,
              controlMode: t.controlMode,
              healthScore: t.healthScore,
              telemetry: t.telemetry,
              remainingUsefulLife: t.remainingUsefulLife,
              totalEnergyGenerated: t.totalEnergyGenerated
            }
          }
        }
      }));
      await Turbine.bulkWrite(ops);
    } catch {
      // Quietly handled
    }
  }

  async persistHistorySnapshotToMongoDB(timestamp) {
    try {
      const docs = this.turbines.map(t => ({
        turbineId: t.turbineId,
        timestamp: new Date(timestamp),
        activePower: t.telemetry.activePower,
        windSpeed: t.telemetry.windSpeed,
        rotorSpeed: t.telemetry.rotorSpeed,
        generatorTemp: t.telemetry.generatorTemp,
        gearboxVibration: t.telemetry.gearboxVibration,
        efficiency: t.telemetry.efficiency
      }));
      await TelemetryHistory.insertMany(docs);
    } catch {
      // Quietly handled
    }
  }

  checkAlertConditions(t) {
    // Gearbox vibration check against configured critical threshold
    if (t.telemetry.gearboxVibration > this.thresholds.vibrationCritical && !this.hasActiveAlert(t.turbineId, 'GEARBOX_VIBRATION_CRITICAL')) {
      this.addAlert({
        turbineId: t.turbineId,
        turbineName: t.name,
        severity: 'CRITICAL',
        code: 'GEARBOX_VIBRATION_CRITICAL',
        message: `High vibration (${t.telemetry.gearboxVibration} mm/s) detected on turbine ${t.name}. Planetary gearbox wear risk.`,
        parameter: 'gearboxVibration',
        value: t.telemetry.gearboxVibration,
        threshold: this.thresholds.vibrationCritical
      });
    }

    // Generator Overheat check against configured generatorTempCritical threshold
    if (t.telemetry.generatorTemp > this.thresholds.generatorTempCritical && !this.hasActiveAlert(t.turbineId, 'GENERATOR_OVERHEAT')) {
      this.addAlert({
        turbineId: t.turbineId,
        turbineName: t.name,
        severity: 'CRITICAL',
        code: 'GENERATOR_OVERHEAT',
        message: `Generator temperature reached ${t.telemetry.generatorTemp} °C. Exceeds safe thermal threshold (${this.thresholds.generatorTempCritical} °C).`,
        parameter: 'generatorTemp',
        value: t.telemetry.generatorTemp,
        threshold: this.thresholds.generatorTempCritical
      });
    }

    // Bearing Overheat check
    if (t.telemetry.bearingTemp > this.thresholds.bearingTempWarning && !this.hasActiveAlert(t.turbineId, 'BEARING_OVERHEAT')) {
      this.addAlert({
        turbineId: t.turbineId,
        turbineName: t.name,
        severity: 'WARNING',
        code: 'BEARING_OVERHEAT',
        message: `Main bearing temperature elevated (${t.telemetry.bearingTemp} °C). Friction warning.`,
        parameter: 'bearingTemp',
        value: t.telemetry.bearingTemp,
        threshold: this.thresholds.bearingTempWarning
      });
    }
  }

  hasActiveAlert(turbineId, code) {
    return this.alerts.some(a => a.turbineId === turbineId && a.code === code && a.status === 'ACTIVE');
  }

  async addAlert(alertData) {
    const newAlert = {
      id: `ALT-${Date.now().toString().slice(-5)}`,
      ...alertData,
      status: 'ACTIVE',
      timestamp: new Date()
    };
    this.alerts.unshift(newAlert);
    if (this.alerts.length > 100) this.alerts.pop();

    // Persist to MongoDB
    try {
      const createdAlert = await Alert.create({
        turbineId: alertData.turbineId,
        turbineName: alertData.turbineName,
        severity: alertData.severity,
        code: alertData.code,
        message: alertData.message,
        parameter: alertData.parameter,
        value: alertData.value,
        threshold: alertData.threshold,
        status: 'ACTIVE',
        timestamp: newAlert.timestamp
      });
      newAlert.id = createdAlert._id.toString();
    } catch {
      // Quietly handled
    }

    if (this.io) {
      this.io.emit('alert_new', newAlert);
    }
  }

  getSummaryStats() {
    const totalPower = this.turbines.reduce((acc, t) => acc + t.telemetry.activePower, 0);
    const totalCapacity = this.turbines.reduce((acc, t) => acc + t.ratedCapacity * 1000, 0);
    const activeTurbines = this.turbines.filter(t => t.status === 'OPTIMAL' || t.status === 'WARNING').length;
    const avgHealth = Math.round(this.turbines.reduce((acc, t) => acc + t.healthScore, 0) / this.turbines.length);
    const avgWind = (this.turbines.reduce((acc, t) => acc + t.telemetry.windSpeed, 0) / this.turbines.length).toFixed(1);
    
    // Carbon offset: ~0.85 kg CO2 saved per kWh = 0.85 tons per MWh
    const totalMWh = this.turbines.reduce((acc, t) => acc + t.totalEnergyGenerated, 0);
    const co2OffsetTons = Math.round(totalMWh * 0.85);

    // Revenue calculation: avg $65 per MWh
    const todayMWh = (totalPower / 1000) * 24; // projected daily
    const dailyRevenueUSD = Math.round(todayMWh * 65);

    return {
      totalPowerKW: totalPower,
      totalPowerMW: (totalPower / 1000).toFixed(2),
      totalCapacityMW: (totalCapacity / 1000).toFixed(1),
      capacityFactor: ((totalPower / totalCapacity) * 100).toFixed(1),
      activeTurbines,
      totalTurbines: this.turbines.length,
      averageHealthScore: avgHealth,
      averageWindSpeed: avgWind,
      co2OffsetTons,
      dailyRevenueUSD,
      activeAlertsCount: this.alerts.filter(a => a.status === 'ACTIVE').length
    };
  }

  getSystemDaemonStats() {
    return {
      sensorLoopActive: true,
      loopIntervalMs: 1500,
      totalTicks: this.stepCounter,
      lastTickAt: this.lastTickAt,
      monitoredSensors: [
        'Wind Speed (Anemometer)',
        'Rotor RPM (Optical Encoder)',
        'Blade Pitch (Hydraulic Resolver)',
        'Generator Stator Temp (RTD Pt100)',
        'Gearbox Vibration (Triaxial Accelerometer)',
        'Main Bearing Temp (Thermocouple)',
        'Lubrication Oil Pressure (Piezoresistive Transducer)',
        'Grid Frequency & Phase (Power Quality Meter)'
      ],
      activeThresholds: this.thresholds,
      databaseSyncCycle: 'Every 6s (BulkWrite)',
      timeSeriesSnapshotCycle: 'Every 30s (TelemetryHistory)',
      automatedProtection: {
        autoPitchFeathering: 'Enabled (at > ' + this.thresholds.cutOutWindSpeed + ' m/s)',
        thermalThrottle: 'Enabled',
        vibrationEmergencyBrake: 'Ready'
      }
    };
  }

  getPowerCurveData() {
    const data = [];
    for (let v = 0; v <= 25; v += 1) {
      const theo3_5 = this.calculatePower(v, 3.5, 'OPTIMAL');
      const theo4_2 = this.calculatePower(v, 4.2, 'OPTIMAL');
      const theo5_0 = this.calculatePower(v, 5.0, 'OPTIMAL');
      data.push({
        windSpeed: v,
        theoretical3_5: Math.round(theo3_5),
        theoretical4_2: Math.round(theo4_2),
        theoretical5_0: Math.round(theo5_0)
      });
    }
    return data;
  }
}

const telemetryStore = new TelemetryStore();

// Start telemetry loop every 1.5s
setInterval(() => {
  telemetryStore.updateSimulationStep();
}, 1500);

module.exports = telemetryStore;
