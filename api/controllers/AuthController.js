const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { registerSchema, loginSchema } = require("../utils/validationSchema");
const User = require("../models/user");
const SECRET_KEY = process.env.JWT_SECRET || "secret-key";

// Register a new user
const register = async (req, res) => {
    try {
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ error: 'Invalid JSON body' });
        }
        // Validate request body using Joi schema
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { email, first_name, last_name, password } = value;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ error: "User already exists" });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = new User({
            email,
            first_name,
            last_name,
            password: hashedPassword,
        });
        await newUser.save();

        const data = {
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            email: newUser.email,
            created_at: newUser.created_at,
            updated_at: newUser.updated_at,
        };

        // Generate JWT token
        const token = jwt.sign({ id: newUser.id }, SECRET_KEY, { expiresIn: "1h" });

        // Send success response
        res.setHeader("Cntent-Type", "application/json");
        return res.status(201).json({ message: "User registered successfully", token, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Login existing user
const login = async (req, res) => {
    try {
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ error: 'Invalid JSON body' });
        }
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const { email, password } = value;

        // Check if user exists
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: "1h" });

        const data = {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            created_at: user.created_at,
            updated_at: user.updated_at,
        };

        // Send success response
        res.setHeader("Cntent-Type", "application/json");
        res.status(200).json({ message: "Login successful", token, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { register, login };
