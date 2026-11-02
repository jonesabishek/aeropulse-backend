const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['ADMIN', 'OPERATOR', 'MAINTENANCE_ENGINEER', 'SYSTEM'], 
    default: 'OPERATOR' 
  },
  department: { type: String, default: 'Wind Operations' },
  avatarColor: { type: String, default: '#ec4899' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
