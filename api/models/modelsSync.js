const { sequelize } = require("../database/database");
require("./relationship");

(async () => {
    try {
        await sequelize.authenticate();
        console.log("Connection has been established successfully.");

        await sequelize.sync({ alter: true });
        console.log("All models and tables are synchronized successfully.");
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
})();
