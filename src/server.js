const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
const userRoutes = require("./routes");
const connectDB = require("./database"); // ✅ Ensure this is imported

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Ensure MongoDB connection is established
connectDB(); 

// Prefix API routes with `/api`
app.use("/api", userRoutes);

app.get("/", (req, res) => {
    res.send("Gabriel Money API is running...");
});

module.exports = app;
module.exports.handler = serverless(app);
