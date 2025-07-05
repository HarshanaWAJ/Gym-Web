const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const connectDB = require('./configs/db'); // Import the connectDB function from db.js

dotenv.config();

connectDB(); // Connect to MongoDB using the connectDB function from db.js

const app = express();
app.use(cors());
app.use(express.json());

// Import routes

// Server Run 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
