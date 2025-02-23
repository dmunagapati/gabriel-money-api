const express = require("express");
const User = require("./models");

const router = express.Router();

// ✅ Create a new user (POST /users)
router.post("/users", async (req, res) => {
    try {
        const { first_name, last_name, email, phone_number } = req.body;
        
        // Check if the email already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: "User with this email already exists" });
        }

        user = new User({ first_name, last_name, email, phone_number });
        await user.save();
        res.status(201).json({ message: "User created", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Retrieve a user by ID (GET /users/:userId)
router.get("/users/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Update a user by ID (PATCH /users/:userId)
router.patch("/users/:userId", async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.userId, req.body, { new: true });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ message: "User updated", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete("/users/:userId", async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
