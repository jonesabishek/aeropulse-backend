const mongoose = require('mongoose');
const net = require('net');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let isConnected = false;
let dbInfo = {
  connected: false,
  uri: '',
  dbName: 'aeropulse_wind',
  host: '127.0.0.1:27017',
  error: null
};

// Check if a TCP port is open
function isPortOpen(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

// Ensure local MongoDB binary is running if installed
async function ensureLocalMongoDaemon() {
  const defaultPort = 27017;
  const isOpen = await isPortOpen(defaultPort, '127.0.0.1');
  if (isOpen) {
    console.log('[MongoDB] Instance already active on port ' + defaultPort);
    return true;
  }

  // Common mongod binary paths on Windows
  const candidatePaths = [
    'C:\\Program Files\\MongoDB\\Server\\9.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe'
  ];

  const mongodPath = candidatePaths.find(p => fs.existsSync(p));
  if (!mongodPath) {
    console.log('[MongoDB] No local mongod.exe found at default paths.');
    return false;
  }

  // Ensure data directory exists
  const homeDir = process.env.USERPROFILE || process.env.HOME || 'C:\\';
  const dataDir = path.join(homeDir, '.mongodb', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  console.log(`[MongoDB] Auto-starting mongod daemon from ${mongodPath}...`);
  try {
    const child = spawn(mongodPath, ['--dbpath', dataDir, '--bind_ip', '127.0.0.1', '--port', '27017'], {
      detached: true,
      stdio: 'ignore'
    });
    child.unref();

    // Wait up to 5 seconds for port to open
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 500));
      if (await isPortOpen(defaultPort, '127.0.0.1')) {
        console.log('[MongoDB] Local mongod daemon started and listening on port 27017.');
        return true;
      }
    }
  } catch (err) {
    console.warn('[MongoDB] Could not auto-launch mongod daemon:', err.message);
  }

  return false;
}

async function connectDB() {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aeropulse_wind';

  // If local URI, try to ensure daemon is active
  if (mongoURI.includes('127.0.0.1') || mongoURI.includes('localhost')) {
    await ensureLocalMongoDaemon();
  }

  try {
    const isAtlas = mongoURI.includes('mongodb+srv') || mongoURI.includes('.mongodb.net');
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000
    });

    isConnected = true;
    const hostDisplay = conn.connection.host + (conn.connection.port ? `:${conn.connection.port}` : '');
    dbInfo = {
      connected: true,
      isAtlas: isAtlas,
      uri: mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'), // Mask credentials
      dbName: conn.connection.name || 'aeropulse_wind',
      host: isAtlas ? `${hostDisplay} (MongoDB Atlas Cloud)` : hostDisplay,
      error: null
    };

    console.log(`\n======================================================`);
    console.log(` [MongoDB] Connected successfully to Database: ${dbInfo.dbName}`);
    console.log(` [MongoDB] Target: ${dbInfo.host}`);
    console.log(` [MongoDB] Deployment: ${isAtlas ? 'MongoDB Atlas (Cloud Cluster)' : 'Local Daemon'}`);
    console.log(`======================================================\n`);

    // Run database seeder if necessary
    const seedDatabase = require('./seed');
    await seedDatabase();

    return conn;
  } catch (error) {
    isConnected = false;
    dbInfo = {
      connected: false,
      uri: mongoURI,
      dbName: 'aeropulse_wind (offline)',
      host: 'unavailable',
      error: error.message
    };

    console.warn(`[MongoDB] Connection error: ${error.message}`);
    console.warn(`[MongoDB] Operating with high-performance in-memory simulation store.`);
    return null;
  }
}

function getDbStatus() {
  return {
    ...dbInfo,
    readyState: mongoose.connection.readyState // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
  };
}

module.exports = {
  connectDB,
  getDbStatus,
  isConnected: () => isConnected
};
