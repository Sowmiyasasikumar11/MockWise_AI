const app  = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to the database before starting the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
});
