const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const customerRoutes = require("./routes/customerRoutes");
const leadRoutes = require("./routes/leadRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const errorHandler = require("./middleware/errorMiddleware");

const app = express();

//Global Middlewares
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/dashboard", dashboardRoutes);


app.get("/", (req, res) => {
    res.status(200).json({
        success : true,
        message : "CRM Backend Server is running",
    });
});

//404 handler
app.use((req, res) =>{
    res.status(404).json({
        success : false,
        message : `Route not found : ${req.method} ${req.originalUrl}`
    });
});


//error handling middleware
app.use(errorHandler);

module.exports = app;
