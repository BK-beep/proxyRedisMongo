
const mongoose = require('mongoose');

const connectDB = async () => {
    console.log('Connecting to MongoDB...');
  try {
    await mongoose.connect('mongodb+srv://khaoula:khaoula@myatlasclusteredu.xjxnnz3.mongodb.net/redis', {});
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit the process if there's an error
  }
};

module.exports = connectDB;
