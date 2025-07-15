// Server File
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Import routes
const productRoutes = require('./routes/productRoute');

const connectDB = require('./configs/db'); // Import the connectDB function from db.js

dotenv.config();

connectDB(); // Connect to MongoDB using the connectDB function from db.js

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/products', productRoutes); // Use the product routes

// Server Run 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

