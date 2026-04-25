const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, HOST, () => {
      console.log(`Server running on http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error(error.message || 'Failed to start the LifeLine API.');
    process.exit(1);
  }
}

startServer();
