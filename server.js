const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();
dotenv.config({ path: path.join(__dirname, '.env') });

const { connectDB, getDbStatus } = require('./config/db');
const telemetryStore = require('./services/telemetrySimulator');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app);

// Enable CORS for frontend development
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
}));

app.use(express.json());

// Setup Socket.IO
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

telemetryStore.setSocketIO(io);

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);
  
  // Send immediate initial data snapshot to newly connected client
  socket.emit('initial_state', {
    turbines: telemetryStore.turbines,
    alerts: telemetryStore.alerts,
    workOrders: telemetryStore.workOrders,
    summary: telemetryStore.getSummaryStats(),
    thresholds: telemetryStore.thresholds,
    database: getDbStatus()
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    system: 'AeroPulse Wind Telemetry Engine',
    database: getDbStatus(),
    timestamp: new Date()
  });
});

// Serve frontend static build on port 5000 so visiting http://localhost:5000 loads the full React app!
const distPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  
  // For any non-API route, send index.html (SPA Fallback)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // If dist not built yet, redirect or provide clear message
  app.get('/', (req, res) => {
    res.send(`
      <div style="font-family: system-ui; text-align: center; padding: 40px; background: #0f172a; color: white; min-height: 100vh;">
        <h1 style="color: #007a78;">AeroPulse AI API Server (Port 5000)</h1>
        <p>The backend API is running. The React UI is accessible at:</p>
        <p><a href="http://localhost:3000" style="color: #14b8a6; font-size: 20px; font-weight: bold;">👉 Open http://localhost:3000</a></p>
      </div>
    `);
  });
}

const PORT = process.env.PORT || 5000;

// Initialize Database connection then start HTTP/WebSocket server
connectDB().then(() => {
  telemetryStore.loadFromDb();
  server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(` AeroPulse Wind Telemetry Server running on port ${PORT}`);
    console.log(` Web UI & API: http://localhost:${PORT}`);
    console.log(` REST API: http://localhost:${PORT}/api/summary`);
    console.log(` Database Status: http://localhost:${PORT}/api/database/status`);
    console.log(` Auth Endpoints: http://localhost:${PORT}/api/auth/login`);
    console.log(` Socket.IO WebSocket Server Active`);
    console.log(`======================================================\n`);
  });
}).catch(err => {
  console.error('[Startup] Failed to initialize database:', err);
  server.listen(PORT, () => {
    console.log(` AeroPulse running in memory-only mode on port ${PORT}`);
  });
});
