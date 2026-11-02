const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be configured in production.');
}

const JWT_SECRET = process.env.JWT_SECRET || 'development-only-secret-change-before-deploy';

// Helper to generate JWT token
function generateToken(user) {
  return jwt.sign(
    { 
      id: user._id || user.id, 
      email: user.email, 
      role: user.role, 
      name: user.name 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/login - Authenticate user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact Administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatarColor: user.avatarColor
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/register - Register new user account
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email address already registered' });
    }

    const validRoles = ['ADMIN', 'OPERATOR', 'MAINTENANCE_ENGINEER', 'SYSTEM'];
    const assignedRole = validRoles.includes(role) ? role : 'OPERATOR';

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const roleColors = {
      ADMIN: '#d946ef',
      OPERATOR: '#ec4899',
      MAINTENANCE_ENGINEER: '#8b5cf6',
      SYSTEM: '#06b6d4'
    };

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: assignedRole,
      department: department || (assignedRole === 'ADMIN' ? 'Fleet Administration' : assignedRole === 'MAINTENANCE_ENGINEER' ? 'Field Engineering' : 'Turbine Control Room'),
      avatarColor: roleColors[assignedRole] || '#ec4899'
    });

    const token = generateToken(newUser);
    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        avatarColor: newUser.avatarColor
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/auth/users - List all users (Admin view)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/users - Admin adds a user
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Missing required user fields' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email address already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const roleColors = {
      ADMIN: '#d946ef',
      OPERATOR: '#ec4899',
      MAINTENANCE_ENGINEER: '#8b5cf6',
      SYSTEM: '#06b6d4'
    };

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'OPERATOR',
      department: department || 'Wind Operations',
      avatarColor: roleColors[role] || '#ec4899'
    });

    res.status(201).json({
      success: true,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        avatarColor: newUser.avatarColor,
        isActive: newUser.isActive
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/auth/users/:id - Admin updates a user (role, department, active status)
router.patch('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { role, department, isActive, name } = req.body;

    const updates = {};
    if (role) updates.role = role;
    if (department) updates.department = department;
    if (typeof isActive === 'boolean') updates.isActive = isActive;
    if (name) updates.name = name;

    const updatedUser = await User.findByIdAndUpdate(id, { $set: updates }, { new: true }).select('-password');
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/auth/users/:id - Admin deletes a user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: `User ${deleted.name} (${deleted.email}) deleted` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
