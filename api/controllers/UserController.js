const bcrypt = require("bcrypt");
const Joi = require("joi");

const { updateUserSchema } = require("../utils/validationSchema");
const User = require("../models/user");

const updateUser = async (req, res) => {
    try {
        // Validate the user data
        const { error, value } = updateUserSchema.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { first_name, last_name, email, password } = value;

        // check that atleast one of the fields is present for update to happen
        if (!first_name && !last_name && !email && !password) {
            return res.status(400).json({ error: "payload cannot be empty" })
        }

        // Find the user by their ID
        const user = await User.findOne({ where: { id: req.user.id } });
        if (!user) return res.status(404).json({ error: "User not found" });

        const toUpdate = {};

        let hashedPassword;
        if (password) {
            // Hash the password
            const saltRounds = 10;
            hashedPassword = await bcrypt.hash(password, saltRounds);
            toUpdate.password = hashedPassword;
        }
        if (first_name) {
            toUpdate.first_name = first_name;
        }
        if (last_name) {
            toUpdate.last_name = last_name;
        }
        if (email) {
            // Check if the new email already exists
            const existingEmailUser = await User.findOne({ where: { email } });
            if (existingEmailUser) {
                return res.status(409).json({ error: "Email already in use" });
            }
            toUpdate.email = email;
            toUpdate.email = email;
        }

        // Update user fields
        await user.update(toUpdate);

        const data = {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            created_at: user.created_at,
            updated_at: user.updated_at,
        };

        return res.json({ message: "User profile updated successfully", data });
    } catch (error) {
        console.error("Update user error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

const deleteUser = async (req, res) => {
    try {
        // Find the user by their ID
        const user = await User.findOne({ where: { id: req.user.id } });
        if (!user) return res.status(404).json({ error: "User not found" });

        // Delete the user
        await user.destroy();

        res.json({ message: "User account deleted successfully" });
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = { updateUser, deleteUser };
