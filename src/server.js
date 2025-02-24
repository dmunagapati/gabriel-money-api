const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http"); // Import for Vercel Serverless
const userRoutes = require("./routes");

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// Prefix API routes with `/api`
app.use("/api", userRoutes);

app.get("/", (req, res) => {
    res.send("Gabriel Money API is running...");
});

// Export for Vercel Serverless Functions
module.exports = app;
module.exports.handler = serverless(app);
