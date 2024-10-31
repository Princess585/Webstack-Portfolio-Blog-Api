const { sequelize } = require("../database/database");
require("./relationship");

(async () => {
    try {
        await sequelize.authenticate();

        await sequelize.sync({ alter: true });
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
})();
