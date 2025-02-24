const express = require("express");
const User = require("./models"); // Import the User model

const router = express.Router();

/**
 * 📌 Create a new user (POST /users)
 */
router.post("/users", async (req, res) => {
    try {
        const { first_name, last_name, email, phone_number } = req.body;

        // Validate required fields
        if (!first_name || !last_name || !email || !phone_number) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Check if a user with this email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User with this email already exists" });
        }

        // Create and save the user
        const newUser = new User({ first_name, last_name, email, phone_number });
        await newUser.save();

        res.status(201).json({ userId: newUser._id });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Failed to create user" });
    }
});


/**
 * 📌 Retrieve a user by ID (GET /users/:userId)
 */
router.get("/users/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Failed to retrieve user" });
    }
});

/**
 * 📌 Update user information (PATCH /users/:userId)
 */
router.patch("/users/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;

        const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Failed to update user" });
    }
});

/**
 * 📌 Delete a user (DELETE /users/:userId)
 */
router.delete("/users/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Failed to delete user" });
    }
});

module.exports = router;

const axios = require("axios"); // Import Axios
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

        // Fetch all API responses concurrently
        const requests = Object.entries(endpoints).map(async ([key, url]) => {
            try {
                const response = await axios.get(url);
                return { key, data: response.data };
            } catch (error) {
                console.error(`Error fetching ${key}:`, error.message);
                return { key, data: null }; // Handle API failures gracefully
            }
        });

        const responses = await Promise.all(requests);

        // Structure response object
        const aggregatedData = responses.reduce((acc, response) => {
            acc[response.key] = response.data;
            return acc;
        }, {});

        // Format userInfo
        if (aggregatedData.userInfo) {
            aggregatedData.userInfo = {
                id: aggregatedData.userInfo.customer_id,
                name: `${aggregatedData.userInfo.first_name} ${aggregatedData.userInfo.last_name}`,
                email: aggregatedData.userInfo.email,
                phone: aggregatedData.userInfo.phone
            };
        }

        // Format accountInfo
        if (aggregatedData.accountInfo) {
            aggregatedData.accountInfo = {
                accountId: aggregatedData.accountInfo.account_id,
                balance: aggregatedData.accountInfo.balance.current_balance / 100, // Convert cents to dollars
                currency: aggregatedData.accountInfo.balance.currency
            };
        }

        // Format cardInfo
        if (aggregatedData.cardInfo) {
            aggregatedData.cardInfo = {
                cardId: aggregatedData.cardInfo.card_id,
                cardType: "Credit", // Assuming all are credit cards
                expiryDate: aggregatedData.cardInfo.expiry_date.substring(0, 2) + "/" + aggregatedData.cardInfo.expiry_date.substring(2) // Format MM/YYYY
            };
        }

        // Sort transactions and return only the latest 3
        if (aggregatedData.transactionsInfo && Array.isArray(aggregatedData.transactionsInfo)) {
            aggregatedData.transactionsInfo.sort((a, b) => new Date(b.created_time) - new Date(a.created_time));
            aggregatedData.transactionsInfo = aggregatedData.transactionsInfo.slice(0, 3).map(txn => ({
                transaction_id: txn.transaction_id,
                created_time: txn.created_time,
                state: txn.state,
                amount: parseFloat(txn.amount),
                details: {
                    mcc: txn.details.mcc,
                    mcc_description: txn.details.mcc_description,
                    currency: txn.details.currency,
                    merchant_name: txn.details.merchant_name,
                    merchant_city: txn.details.merchant_city,
                    merchant_state: txn.details.merchant_state
                }
            }));
        }

        res.json(aggregatedData);
    } catch (err) {
        console.error("Aggregated API Error:", err);
        res.status(500).json({ error: "Failed to fetch aggregated user data" });
    }
});
