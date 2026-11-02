const bcrypt = require('bcryptjs');
const Turbine = require('../models/Turbine');
const Alert = require('../models/Alert');
const WorkOrder = require('../models/WorkOrder');
const TelemetryHistory = require('../models/TelemetryHistory');
const User = require('../models/User');
const Threshold = require('../models/Threshold');

const seedTurbinesData = [
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

const seedAlertsData = [
  {
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
  },
  {
    turbineId: 'T-303',
    turbineName: 'Oceanus Triton-3',
    severity: 'WARNING',
    code: 'GUST_SURGE_DAMPENED',
    message: 'Transient offshore gust spike (18.4 m/s) detected and managed by adaptive pitch governor.',
    parameter: 'windSpeed',
    value: 18.4,
    threshold: 16.0,
    status: 'RESOLVED',
    timestamp: new Date(Date.now() - 240 * 60000)
  }
];

const seedWorkOrdersData = [
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

// The 4 People representing the Actors from UML Use Case Diagram
const seedUsersData = [
  {
    name: 'Elena Vance',
    email: 'admin@aeropulse.io',
    password: 'admin123',
    role: 'ADMIN',
    department: 'Global Fleet Operations & Infrastructure',
    avatarColor: '#d946ef'
  },
  {
    name: 'Marcus Chen',
    email: 'operator@aeropulse.io',
    password: 'operator123',
    role: 'OPERATOR',
    department: 'Real-Time Grid Dispatch & Control',
    avatarColor: '#ec4899'
  },
  {
    name: 'Dr. Sarah Connor',
    email: 'engineer@aeropulse.io',
    password: 'engineer123',
    role: 'MAINTENANCE_ENGINEER',
    department: 'Predictive Reliability & Field Robotics',
    avatarColor: '#8b5cf6'
  },
  {
    name: 'Alex Rivera',
    email: 'system@aeropulse.io',
    password: 'system123',
    role: 'SYSTEM',
    department: 'Automated Daemon & Telemetry Infrastructure',
    avatarColor: '#06b6d4'
  }
];

const defaultThresholdData = {
  configName: 'Default Wind Farm Profile',
  vibrationWarning: 3.0,
  vibrationCritical: 4.5,
  generatorTempWarning: 75.0,
  generatorTempCritical: 85.0,
  bearingTempWarning: 70.0,
  bearingTempCritical: 85.0,
  oilPressureMin: 2.5,
  cutInWindSpeed: 3.0,
  cutOutWindSpeed: 25.0,
  updatedBy: 'Elena Vance (Admin)'
};

async function seedDatabase(force = false) {
  try {
    // 1. Seed 4 Different Users / Roles
    const userCount = await User.countDocuments();
    if (userCount === 0 || force) {
      if (force) await User.deleteMany({});
      for (const u of seedUsersData) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(u.password, salt);
        await User.create({
          name: u.name,
          email: u.email,
          password: hashedPassword,
          role: u.role,
          department: u.department,
          avatarColor: u.avatarColor
        });
      }
      console.log(`[MongoDB] Seeded ${seedUsersData.length} Users for the 4 Actors (Admin, Operator, Engineer, System).`);
    }

    // 2. Seed Operational Threshold Values
    const thresholdCount = await Threshold.countDocuments();
    if (thresholdCount === 0 || force) {
      if (force) await Threshold.deleteMany({});
      await Threshold.create(defaultThresholdData);
      console.log('[MongoDB] Seeded Default Operational Sensor Thresholds.');
    }

    // 3. Seed Turbines
    const turbineCount = await Turbine.countDocuments();
    if (turbineCount === 0 || force) {
      if (force) await Turbine.deleteMany({});
      await Turbine.insertMany(seedTurbinesData);
      console.log(`[MongoDB] Seeded ${seedTurbinesData.length} Turbines into MongoDB collection.`);
    }

    // 4. Seed Alerts
    const alertCount = await Alert.countDocuments();
    if (alertCount === 0 || force) {
      if (force) await Alert.deleteMany({});
      await Alert.insertMany(seedAlertsData);
      console.log(`[MongoDB] Seeded ${seedAlertsData.length} Alerts into MongoDB collection.`);
    }

    // 5. Seed Work Orders
    const workOrderCount = await WorkOrder.countDocuments();
    if (workOrderCount === 0 || force) {
      if (force) await WorkOrder.deleteMany({});
      await WorkOrder.insertMany(seedWorkOrdersData);
      console.log(`[MongoDB] Seeded ${seedWorkOrdersData.length} Work Orders into MongoDB collection.`);
    }

    // 6. Seed Telemetry History
    const historyCount = await TelemetryHistory.countDocuments();
    if (historyCount === 0 || force) {
      if (force) await TelemetryHistory.deleteMany({});
      const historyDocs = [];
      const now = Date.now();
      seedTurbinesData.forEach(t => {
        for (let i = 24; i >= 0; i--) {
          const time = new Date(now - i * 3600000);
          const wind = Math.max(2, t.telemetry.windSpeed + (Math.random() - 0.5) * 3);
          const maxKW = t.ratedCapacity * 1000;
          const ratio = Math.pow((wind - 3.0) / (12.5 - 3.0), 2.7);
          const power = Math.min(maxKW, Math.max(0, Math.round(maxKW * ratio)));
          historyDocs.push({
            turbineId: t.turbineId,
            timestamp: time,
            activePower: power,
            windSpeed: Number(wind.toFixed(1)),
            rotorSpeed: Number((wind * 1.35).toFixed(1)),
            generatorTemp: Number((t.telemetry.generatorTemp + (Math.random() - 0.5) * 4).toFixed(1)),
            gearboxVibration: Number((t.telemetry.gearboxVibration + (Math.random() - 0.5) * 0.4).toFixed(2)),
            efficiency: Number((t.telemetry.efficiency + (Math.random() - 0.5) * 2).toFixed(1))
          });
        }
      });
      await TelemetryHistory.insertMany(historyDocs);
      console.log(`[MongoDB] Seeded ${historyDocs.length} Telemetry History records into MongoDB collection.`);
    }
  } catch (err) {
    console.error('[MongoDB] Error during seeding:', err.message);
  }
}

module.exports = seedDatabase;
