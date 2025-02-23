const express = require("express");
const cors = require("cors");
const connectDB = require("./database");
const userRoutes = require("./routes"); // Import the routes

require("dotenv").config();

const app = express();
app.use(express.json()); // Middleware to parse JSON
app.use(cors());

// Connect to MongoDB
connectDB();

// Use the routes
app.use(userRoutes);

app.get("/", (req, res) => {
    res.send("Gabriel Money API is running...");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
