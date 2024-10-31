// Loads the env variables
require("dotenv").config();
const express = require("express");
const cors = require('cors')

require("./api/models/modelsSync");
const router = require("./api/routes/router");

// Create an instance of the express server
const app = express();


// enable the parsing of JSON in the request body
app.use(express.json());

app.use(cors(
    {
        origin: "*",
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed HTTP methods
        credentials: true, // Allow credentials (cookies, authorization headers, etc.)
        optionsSuccessStatus: 200, // Respond with 200 for preflight requests
    }
));

app.use("/", router);

app.use((err, req, res, next) => {
    console.error("Error:", err); // Log the error for debugging

    // Send a standardized error response
    res.status(500).json({
        success: false,
        message: "Internal Server Error",
    });
});

// setup a port for the app from env file or 5000
const PORT = process.env.PORT || 5000;

// DOnt listen on testing
if (process.env.NODE_ENV !== "test") {
    // listen for requests
    app.listen(PORT, () => {
        console.log(`App listening op http://127.0.0.1:${PORT}`);
    });
}


module.exports = app;
