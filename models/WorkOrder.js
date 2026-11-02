const mongoose = require('mongoose');

const workOrderSchema = new mongoose.Schema({
  workOrderId: { type: String, required: true, unique: true },
  turbineId: { type: String, required: true },
  turbineName: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
  status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], default: 'PENDING' },
  technician: { type: String, default: 'Unassigned' },
  assignedDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  estimatedCost: { type: Number, default: 2500 },
  componentsToReplace: [{ type: String }],
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('WorkOrder', workOrderSchema);
