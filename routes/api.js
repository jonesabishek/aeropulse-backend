const express = require('express');
const router = express.Router();
const telemetryStore = require('../services/telemetrySimulator');
const Turbine = require('../models/Turbine');
const Alert = require('../models/Alert');
const WorkOrder = require('../models/WorkOrder');
const TelemetryHistory = require('../models/TelemetryHistory');
const Threshold = require('../models/Threshold');
const { getDbStatus } = require('../config/db');
const seedDatabase = require('../config/seed');

// GET /api/database/status - Real-time MongoDB connection & document metrics
router.get('/database/status', async (req, res) => {
  try {
    const status = getDbStatus();
    let counts = { turbines: 0, alerts: 0, workOrders: 0, telemetryHistory: 0, thresholds: 0 };
    if (status.connected) {
      const [tCount, aCount, wCount, hCount, thCount] = await Promise.all([
        Turbine.countDocuments(),
        Alert.countDocuments(),
        WorkOrder.countDocuments(),
        TelemetryHistory.countDocuments(),
        Threshold.countDocuments()
      ]);
      counts = {
        turbines: tCount,
        alerts: aCount,
        workOrders: wCount,
        telemetryHistory: hCount,
        thresholds: thCount
      };
    }

    res.json({
      success: true,
      database: {
        ...status,
        collections: counts
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/database/seed - Force re-seed database
router.post('/database/seed', async (req, res) => {
  try {
    await seedDatabase(true);
    await telemetryStore.loadFromDb();
    res.json({ success: true, message: 'Database successfully re-seeded and reloaded into memory.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/thresholds - Get current operational thresholds (UML: Set Threshold Values)
router.get('/thresholds', async (req, res) => {
  try {
    let thresholdDoc = await Threshold.findOne().lean();
    if (!thresholdDoc) {
      thresholdDoc = telemetryStore.thresholds;
    }
    res.json({ success: true, thresholds: thresholdDoc });
  } catch (err) {
    res.json({ success: true, thresholds: telemetryStore.thresholds });
  }
});

// PUT /api/thresholds - Set / Update threshold values (UML: Admin: Set Threshold Values)
router.put('/thresholds', async (req, res) => {
  try {
    const {
      vibrationWarning,
      vibrationCritical,
      generatorTempWarning,
      generatorTempCritical,
      bearingTempWarning,
      bearingTempCritical,
      oilPressureMin,
      cutInWindSpeed,
      cutOutWindSpeed,
      updatedBy
    } = req.body;

    const updated = await Threshold.findOneAndUpdate(
      {},
      {
        $set: {
          vibrationWarning: Number(vibrationWarning) || telemetryStore.thresholds.vibrationWarning,
          vibrationCritical: Number(vibrationCritical) || telemetryStore.thresholds.vibrationCritical,
          generatorTempWarning: Number(generatorTempWarning) || telemetryStore.thresholds.generatorTempWarning,
          generatorTempCritical: Number(generatorTempCritical) || telemetryStore.thresholds.generatorTempCritical,
          bearingTempWarning: Number(bearingTempWarning) || telemetryStore.thresholds.bearingTempWarning,
          bearingTempCritical: Number(bearingTempCritical) || telemetryStore.thresholds.bearingTempCritical,
          oilPressureMin: Number(oilPressureMin) || telemetryStore.thresholds.oilPressureMin,
          cutInWindSpeed: Number(cutInWindSpeed) || telemetryStore.thresholds.cutInWindSpeed,
          cutOutWindSpeed: Number(cutOutWindSpeed) || telemetryStore.thresholds.cutOutWindSpeed,
          updatedBy: updatedBy || 'System Administrator',
          lastUpdated: new Date()
        }
      },
      { upsert: true, new: true }
    );

    // Update live simulator thresholds
    telemetryStore.thresholds = {
      vibrationWarning: updated.vibrationWarning,
      vibrationCritical: updated.vibrationCritical,
      generatorTempWarning: updated.generatorTempWarning,
      generatorTempCritical: updated.generatorTempCritical,
      bearingTempWarning: updated.bearingTempWarning,
      bearingTempCritical: updated.bearingTempCritical,
      oilPressureMin: updated.oilPressureMin,
      cutInWindSpeed: updated.cutInWindSpeed,
      cutOutWindSpeed: updated.cutOutWindSpeed
    };

    if (telemetryStore.io) {
      telemetryStore.io.emit('thresholds_updated', telemetryStore.thresholds);
    }

    res.json({ success: true, message: 'Operational sensor thresholds updated successfully', thresholds: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/summary - Overall farm aggregate metrics (UML: View Real-time Dashboard)
router.get('/summary', (req, res) => {
  try {
    const summary = telemetryStore.getSummaryStats();
    res.json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/turbines - List all turbines (UML: Monitor Turbine Parameters)
router.get('/turbines', async (req, res) => {
  try {
    const status = getDbStatus();
    if (status.connected) {
      const dbTurbines = await Turbine.find().lean();
      if (dbTurbines && dbTurbines.length > 0) {
        return res.json({ success: true, turbines: dbTurbines, source: 'MongoDB' });
      }
    }
    res.json({ success: true, turbines: telemetryStore.turbines, source: 'InMemory' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/turbines - Admin adds new turbine (UML: Admin: Manage Turbines & Sensors)
router.post('/turbines', async (req, res) => {
  try {
    const { name, farmLocation, ratedCapacity, modelType, latitude, longitude } = req.body;
    if (!name || !farmLocation) {
      return res.status(400).json({ success: false, message: 'Name and Farm Location are required' });
    }

    const nextIndex = telemetryStore.turbines.length + 1;
    const turbineId = `T-${100 + nextIndex}`;

    const newTurbine = {
      turbineId,
      name: name.trim(),
      farmLocation: farmLocation.trim(),
      latitude: Number(latitude) || 35.12,
      longitude: Number(longitude) || -118.25,
      modelType: modelType || 'AeroVane 3.5MW NextGen',
      ratedCapacity: Number(ratedCapacity) || 3.5,
      status: 'OPTIMAL',
      controlMode: 'AUTO',
      healthScore: 99,
      telemetry: {
        windSpeed: 11.5,
        rotorSpeed: 15.2,
        pitchAngle: 2.0,
        yawAngle: 180.0,
        activePower: Math.round(Number(ratedCapacity || 3.5) * 850),
        reactivePower: 120,
        generatorTemp: 58.0,
        gearboxVibration: 1.1,
        bearingTemp: 52.0,
        oilPressure: 4.5,
        gridFrequency: 60.0,
        efficiency: 97.0,
        ambientTemp: 22.0
      },
      remainingUsefulLife: { gearboxDays: 700, generatorDays: 850, rotorDays: 1200, pitchDays: 500 },
      totalEnergyGenerated: 120,
      lastMaintenance: new Date(),
      nextScheduledMaintenance: new Date(Date.now() + 90 * 86400000)
    };

    // Save in memory
    telemetryStore.turbines.push(newTurbine);
    telemetryStore.historyMap.set(turbineId, []);

    // Save in MongoDB
    try {
      await Turbine.create(newTurbine);
    } catch (e) {
      console.warn('[MongoDB] Save turbine notice:', e.message);
    }

    if (telemetryStore.io) {
      telemetryStore.io.emit('turbine_created', newTurbine);
    }

    res.status(201).json({ success: true, message: `Turbine ${name} commissioned successfully`, turbine: newTurbine });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/turbines/:id - Admin updates turbine details (UML: Admin: Manage Turbines & Sensors)
router.put('/turbines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, farmLocation, ratedCapacity, modelType } = req.body;

    const turbine = telemetryStore.turbines.find(t => t.turbineId === id);
    if (!turbine) {
      return res.status(404).json({ success: false, message: 'Turbine not found' });
    }

    if (name) turbine.name = name;
    if (farmLocation) turbine.farmLocation = farmLocation;
    if (ratedCapacity) turbine.ratedCapacity = Number(ratedCapacity);
    if (modelType) turbine.modelType = modelType;

    try {
      await Turbine.findOneAndUpdate(
        { turbineId: id },
        { $set: { name: turbine.name, farmLocation: turbine.farmLocation, ratedCapacity: turbine.ratedCapacity, modelType: turbine.modelType } }
      );
    } catch {}

    if (telemetryStore.io) {
      telemetryStore.io.emit('turbine_updated', turbine);
    }

    res.json({ success: true, message: `Turbine ${id} updated`, turbine });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/turbines/:id - Admin decommissions turbine (UML: Admin: Manage Turbines & Sensors)
router.delete('/turbines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const index = telemetryStore.turbines.findIndex(t => t.turbineId === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Turbine not found' });
    }

    const removed = telemetryStore.turbines.splice(index, 1)[0];
    telemetryStore.historyMap.delete(id);

    try {
      await Turbine.findOneAndDelete({ turbineId: id });
    } catch {}

    if (telemetryStore.io) {
      telemetryStore.io.emit('turbine_deleted', { turbineId: id });
    }

    res.json({ success: true, message: `Turbine ${removed.name} (${id}) decommissioned from grid` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/turbines/:id - Detailed telemetry + history for single turbine (UML: View Historical Data)
router.get('/turbines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let turbine = telemetryStore.turbines.find(t => t.turbineId === id);
    let history = telemetryStore.historyMap.get(id) || [];

    const status = getDbStatus();
    if (status.connected) {
      const dbTurbine = await Turbine.findOne({ turbineId: id }).lean();
      if (dbTurbine) turbine = dbTurbine;

      const dbHistory = await TelemetryHistory.find({ turbineId: id })
        .sort({ timestamp: -1 })
        .limit(50)
        .lean();
      if (dbHistory && dbHistory.length > 0) {
        history = dbHistory.reverse().map(h => ({
          timestamp: new Date(h.timestamp).toISOString(),
          windSpeed: h.windSpeed,
          activePower: h.activePower,
          rotorSpeed: h.rotorSpeed,
          generatorTemp: h.generatorTemp,
          gearboxVibration: h.gearboxVibration,
          efficiency: h.efficiency
        }));
      }
    }

    if (!turbine) {
      return res.status(404).json({ success: false, message: 'Turbine not found' });
    }

    res.json({ success: true, turbine, history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/turbines/:id/control - Remote command dispatch (Set pitch, Brake, Resume, Status)
router.patch('/turbines/:id/control', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, pitchAngle, status } = req.body;
    
    const turbine = telemetryStore.turbines.find(t => t.turbineId === id);
    if (!turbine) {
      return res.status(404).json({ success: false, message: 'Turbine not found' });
    }

    if (action === 'EMERGENCY_BRAKE') {
      turbine.controlMode = 'EMERGENCY_STOP';
      turbine.telemetry.pitchAngle = 90.0;
      turbine.status = 'WARNING';
    } else if (action === 'RESUME_AUTO') {
      turbine.controlMode = 'AUTO';
      turbine.status = turbine.healthScore > 80 ? 'OPTIMAL' : 'WARNING';
    } else if (action === 'SET_PITCH' && typeof pitchAngle === 'number') {
      turbine.controlMode = 'MANUAL';
      turbine.telemetry.pitchAngle = Math.max(0, Math.min(90, pitchAngle));
    } else if (action === 'SET_STATUS' && status) {
      turbine.status = status;
    }

    try {
      await Turbine.findOneAndUpdate(
        { turbineId: id },
        {
          $set: {
            controlMode: turbine.controlMode,
            status: turbine.status,
            'telemetry.pitchAngle': turbine.telemetry.pitchAngle
          }
        }
      );
    } catch {}

    if (telemetryStore.io) {
      telemetryStore.io.emit('turbine_updated', turbine);
    }

    res.json({ success: true, message: `Control action '${action}' applied to ${turbine.name}`, turbine });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/alerts - Active and resolved alerts (UML: View Alerts & Notifications)
router.get('/alerts', async (req, res) => {
  try {
    const status = getDbStatus();
    if (status.connected) {
      const dbAlerts = await Alert.find().sort({ timestamp: -1 }).limit(100).lean();
      if (dbAlerts && dbAlerts.length > 0) {
        const formatted = dbAlerts.map(a => ({
          id: a._id.toString(),
          ...a
        }));
        return res.json({ success: true, alerts: formatted, source: 'MongoDB' });
      }
    }
    res.json({ success: true, alerts: telemetryStore.alerts, source: 'InMemory' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/alerts/:id/resolve - Acknowledge or resolve alert (UML: Operator: View Alerts)
router.patch('/alerts/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const alert = telemetryStore.alerts.find(a => a.id === id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    alert.status = status || 'RESOLVED';
    
    try {
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        await Alert.findByIdAndUpdate(id, { $set: { status: alert.status } });
      } else {
        await Alert.findOneAndUpdate({ code: alert.code, turbineId: alert.turbineId }, { $set: { status: alert.status } });
      }
    } catch {}

    if (telemetryStore.io) {
      telemetryStore.io.emit('alert_updated', alert);
    }

    res.json({ success: true, alert });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/work-orders - List work orders (UML: Manage Maintenance Schedule)
router.get('/work-orders', async (req, res) => {
  try {
    const status = getDbStatus();
    if (status.connected) {
      const dbWorkOrders = await WorkOrder.find().sort({ createdAt: -1 }).lean();
      if (dbWorkOrders && dbWorkOrders.length > 0) {
        return res.json({ success: true, workOrders: dbWorkOrders, source: 'MongoDB' });
      }
    }
    res.json({ success: true, workOrders: telemetryStore.workOrders, source: 'InMemory' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/work-orders - Schedule Maintenance (UML: Engineer/Admin: Schedule Maintenance)
router.post('/work-orders', async (req, res) => {
  try {
    const { turbineId, title, description, priority, technician, estimatedCost, componentsToReplace } = req.body;
    const turbine = telemetryStore.turbines.find(t => t.turbineId === turbineId);
    
    const newWO = {
      workOrderId: `WO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      turbineId,
      turbineName: turbine ? turbine.name : `Turbine ${turbineId}`,
      title: title || 'Predictive Maintenance Work Order',
      description: description || 'Scheduled inspection based on predictive failure score.',
      priority: priority || 'MEDIUM',
      status: 'PENDING',
      technician: technician || 'Dr. Sarah Connor',
      assignedDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 86400000),
      estimatedCost: estimatedCost || 3200,
      componentsToReplace: componentsToReplace || ['Gearbox Lubricant', 'Thermal RTD Sensor'],
      notes: 'Generated via AeroPulse Maintenance Manager'
    };

    telemetryStore.workOrders.unshift(newWO);

    try {
      await WorkOrder.create(newWO);
    } catch (dbErr) {
      console.warn('[MongoDB] WorkOrder save error:', dbErr.message);
    }

    if (telemetryStore.io) {
      telemetryStore.io.emit('work_order_created', newWO);
    }

    res.status(201).json({ success: true, workOrder: newWO });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/work-orders/:id - Update status (UML: Engineer: Update Maintenance Status)
router.patch('/work-orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, technician, notes } = req.body;
    const wo = telemetryStore.workOrders.find(w => w.workOrderId === id);
    if (!wo) {
      return res.status(404).json({ success: false, message: 'Work Order not found' });
    }

    if (status) wo.status = status;
    if (technician) wo.technician = technician;
    if (notes) wo.notes = notes;

    // If completed, restore turbine health!
    if (status === 'COMPLETED') {
      const turbine = telemetryStore.turbines.find(t => t.turbineId === wo.turbineId);
      if (turbine) {
        turbine.status = 'OPTIMAL';
        turbine.healthScore = Math.min(100, turbine.healthScore + 25);
        turbine.telemetry.gearboxVibration = 1.3;
        turbine.telemetry.generatorTemp = 60.0;
        turbine.remainingUsefulLife.gearboxDays += 360;

        try {
          await Turbine.findOneAndUpdate(
            { turbineId: turbine.turbineId },
            {
              $set: {
                status: 'OPTIMAL',
                healthScore: turbine.healthScore,
                'telemetry.gearboxVibration': 1.3,
                'telemetry.generatorTemp': 60.0,
                'remainingUsefulLife.gearboxDays': turbine.remainingUsefulLife.gearboxDays
              }
            }
          );
        } catch {}
      }
    }

    try {
      await WorkOrder.findOneAndUpdate(
        { workOrderId: id },
        { $set: { status: wo.status, technician: wo.technician, notes: wo.notes } }
      );
    } catch {}

    if (telemetryStore.io) {
      telemetryStore.io.emit('work_order_updated', wo);
    }

    res.json({ success: true, workOrder: wo });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/maintenance/recommendations - AI Maintenance Recommendations (UML: Engineer: View Maintenance Recommendations)
router.get('/maintenance/recommendations', (req, res) => {
  try {
    const recommendations = telemetryStore.turbines.map(t => {
      const issues = [];
      let urgency = 'ROUTINE';

      if (t.remainingUsefulLife.gearboxDays < 45 || t.telemetry.gearboxVibration > 3.5) {
        issues.push({
          component: 'Planetary Gearbox Assembly',
          reason: `High vibration (${t.telemetry.gearboxVibration} mm/s) & Low RUL (${Math.round(t.remainingUsefulLife.gearboxDays)} days)`,
          action: 'Perform oil particulate analysis and inspect high-speed pinion bearing.'
        });
        urgency = 'CRITICAL';
      }

      if (t.telemetry.generatorTemp > 78 || t.remainingUsefulLife.generatorDays < 100) {
        issues.push({
          component: 'Stator Windings & Rotor Cooler',
          reason: `Elevated stator temperature (${t.telemetry.generatorTemp} °C)`,
          action: 'Flush radiator heat exchanger and inspect RTD temperature sensors.'
        });
        if (urgency !== 'CRITICAL') urgency = 'HIGH';
      }

      if (t.remainingUsefulLife.pitchDays < 150) {
        issues.push({
          component: 'Hydraulic Pitch Cylinder Seals',
          reason: `Pitch actuator RUL decaying (${Math.round(t.remainingUsefulLife.pitchDays)} days)`,
          action: 'Calibrate blade angle resolvers and replace hydraulic seal kits.'
        });
        if (urgency === 'ROUTINE') urgency = 'MEDIUM';
      }

      return {
        turbineId: t.turbineId,
        turbineName: t.name,
        farmLocation: t.farmLocation,
        healthScore: t.healthScore,
        urgency,
        issues: issues.length > 0 ? issues : [{
          component: 'All Primary Sub-systems',
          reason: 'Operating within nominal limits',
          action: 'Routine 90-day visual inspection and grease lubrication'
        }]
      };
    });

    res.json({ success: true, recommendations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/reports/summary - Comprehensive Audit Report (UML: Operator/Admin: View Reports / Generate Reports)
router.get('/reports/summary', (req, res) => {
  try {
    const summary = telemetryStore.getSummaryStats();
    const fleetBreakdown = telemetryStore.turbines.map(t => ({
      id: t.turbineId,
      name: t.name,
      location: t.farmLocation,
      status: t.status,
      health: `${t.healthScore}%`,
      activePowerKW: t.telemetry.activePower,
      windSpeedMS: t.telemetry.windSpeed,
      efficiencyPct: `${t.telemetry.efficiency}%`,
      gearboxRulDays: Math.round(t.remainingUsefulLife.gearboxDays)
    }));

    res.json({
      success: true,
      report: {
        generatedAt: new Date().toISOString(),
        reportingFacility: 'AeroPulse Renewable Energy Grid Command',
        gridMetrics: summary,
        fleetBreakdown,
        alertsTotal: telemetryStore.alerts.length,
        activeCriticalAlerts: telemetryStore.alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length,
        openWorkOrders: telemetryStore.workOrders.filter(w => w.status !== 'COMPLETED').length,
        operationalEfficiencyIndex: `${summary.capacityFactor}%`,
        complianceStatus: 'ISO 55001 Asset Management Compliant'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/reports/export - CSV Telemetry Data Download (UML: Generate Reports)
router.get('/reports/export', (req, res) => {
  try {
    let csv = 'Turbine ID,Name,Farm Location,Status,Health Score,Power (kW),Wind Speed (m/s),Rotor (RPM),Gen Temp (C),Vibration (mm/s),Gearbox RUL (Days)\n';
    telemetryStore.turbines.forEach(t => {
      csv += `${t.turbineId},"${t.name}","${t.farmLocation}",${t.status},${t.healthScore},${t.telemetry.activePower},${t.telemetry.windSpeed},${t.telemetry.rotorSpeed},${t.telemetry.generatorTemp},${t.telemetry.gearboxVibration},${Math.round(t.remainingUsefulLife.gearboxDays)}\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment(`AeroPulse_Fleet_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/system/daemon - Automated Telemetry Daemon & Anomaly Engine (UML: System Actor)
router.get('/system/daemon', (req, res) => {
  try {
    const daemonStats = telemetryStore.getSystemDaemonStats();
    res.json({ 
      success: true, 
      daemon: daemonStats,
      stats: daemonStats 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/power-curve - Theoretical power curve comparative data
router.get('/analytics/power-curve', (req, res) => {
  try {
    const powerCurve = telemetryStore.getPowerCurveData();
    res.json({ success: true, powerCurve });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/simulation/weather - Tweak environmental sandbox simulation
router.post('/simulation/weather', (req, res) => {
  try {
    const { windSpeedOffset, tempOffset } = req.body;
    if (typeof windSpeedOffset === 'number') {
      telemetryStore.globalWeatherModifier.windSpeedOffset = windSpeedOffset;
    }
    if (typeof tempOffset === 'number') {
      telemetryStore.globalWeatherModifier.tempOffset = tempOffset;
    }

    res.json({ success: true, globalWeatherModifier: telemetryStore.globalWeatherModifier });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
