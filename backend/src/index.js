const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const habitRoutes = require('./routes/habitRoutes');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

app.get("/",(req,res)=> res.json({ success:true, message:"ONE MORE DAY backend is working" }))

// Routes
app.use('/api/habits', habitRoutes);
app.use('/api/users', userRoutes);

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/one-more-day';

if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      if (process.env.NODE_ENV !== 'production') {
        app.listen(PORT, () => {
          console.log(`Server is running on port ${PORT}`);
        });
      }
    })
    .catch((error) => {
      console.error('MongoDB connection error:', error);
    });
}

module.exports = app;
