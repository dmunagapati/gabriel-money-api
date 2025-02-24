const express = require("express");
const axios = require("axios");
const User = require("./models");

const router = express.Router();

router.get("/users/:userId/aggregated-info", async (req, res) => {
    try {
        const { userId } = req.params;

        const baseURL = "https://dev.api.gabriel.money/backend-challenge";
        const endpoints = {
            userInfo: `${baseURL}/user/${userId}`,
            accountInfo: `${baseURL}/accounts/${userId}`,
            cardInfo: `${baseURL}/cards/${userId}`,
            transactionsInfo: `${baseURL}/transactions/${userId}`
        };

        const requests = Object.entries(endpoints).map(async ([key, url]) => {
            try {
                const response = await axios.get(url);
                return { key, data: response.data };
            } catch (error) {
                console.error(`Error fetching ${key}:`, error.message);
                return { key, data: null };
            }
        });

        const responses = await Promise.all(requests);

        const aggregatedData = responses.reduce((acc, response) => {
            acc[response.key] = response.data;
            return acc;
        }, {});

        res.json(aggregatedData);
    } catch (err) {
        console.error("Aggregated API Error:", err);
        res.status(500).json({ error: "Failed to fetch aggregated user data" });
    }
});

module.exports = router;
