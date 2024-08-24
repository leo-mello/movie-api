require("express-async-errors");

const express = require('express');
const routes = require('./routes');

const migrationsRun = require('./database/sqlite/migrations');

const AppError = require("./utils/AppError");

migrationsRun();

const app = express();
app.use(express.json());
app.use(routes);

app.use((error, req, res, next) => {
    if(error instanceof AppError) {
        return res.status(error.statusCode).json({
            status: "error",
            message: error.message
        })
    }

    console.log(error);

    return res.status(500).json({
        status: "error",
        message: "Internal Server Error"
    })
})

const PORT = 3333;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));