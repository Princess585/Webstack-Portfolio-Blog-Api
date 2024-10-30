// Loads the env variables
require("dotenv").config();
const { Sequelize } = require("sequelize");

console.log("Database URL:", process.env.DATABASE_URL);
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://test_user:test_user_pwd@localhost:5432/blog';

const sequelize = new Sequelize(DATABASE_URL, {
    host: "localhost",
    port: 5432,
    dialect: "postgres",
    define: {
        timestamps: true, // This applies timestamps globally to all models
        underscored: true, // Uses snake_case for column names
    },
    logging: console.log,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});

module.exports = { sequelize };
