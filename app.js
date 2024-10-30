const express = require("express");
const cors = require('cors')
const dotenv = require("dotenv");

require("./api/models/modelsSync");
const router = require("./api/routes/router");

// Loads the env variables
dotenv.config();

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

// setup a port for the app from env file or 5000
const PORT = process.env.PORT || 5000;

// listen for requests
app.listen(PORT, () => {
    console.log(`App listening op http://127.0.0.1:${PORT}`);
});
