require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { initWorkers } = require('./jobs/workers');
const { logEvent } = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Initialize Background Queue Workers
  initWorkers();

  const server = app.listen(PORT, () => {
    logEvent('Server', `PulseCare Healthcare Server running on port ${PORT}`);
    console.log(`[PulseCare Server] Listening at http://localhost:${PORT}`);
  });

  // Handle Unhandled Promise Rejections
  process.on('unhandledRejection', (err) => {
    console.error(`[Unhandled Rejection] ${err.message}`);
  });
};

startServer();
