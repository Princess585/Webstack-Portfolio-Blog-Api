const { Sequelize } = require("sequelize");

const DATABASE_URL = process.env.DATABASE_URL;

const sequelize = new Sequelize(DATABASE_URL, {
    host: "localhost",
    port: 5432,
    dialect: "postgres",
    define: {
        timestamps: true, // This applies timestamps globally to all models
        underscored: true, // Uses snake_case for column names
    },
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});

module.exports = { sequelize };
