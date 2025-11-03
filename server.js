/** @format */

const express = require("express");
const cors = require("cors");
const { connect } = require("./database/connection");

// Import routers
const labRouter = require("./routes/lab");
const zoneRouter = require("./routes/zone");
const testRouter = require("./routes/test");

// const categoryRouter = require("./routes/category");

const app = express();

// Middlewares
app.use(express.json({ limit: "10kb" }));
const corsOptions = {
  origin: "http://localhost:5173", // Allow only your frontend
  credentials: true, // Allow cookies and authorization headers
};

app.use(cors(corsOptions));

// Routes
app.get("/", (req, res, next) => {
  res.status(200).send({ success: true, msg: "Admin Server is running" });
});

// Use routers
app.use("/api/v1/lab", labRouter);
app.use("/api/v1/zone", zoneRouter);
// app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/test", testRouter);

// 404 Not Found Handler
app.use((req, res, next) => {
  res.status(404).send({
    success: false,
    message: "The requested resource was not found on this server.",
    statusCode: 404,
  });
});

// Central Error Handler
app.use((error, req, res, next) => {
  console.log("######## Central Error Handler #########");
  console.log(error.message);
  res.status(500).send({ success: false, message: error.message });
});

// Start the Server
app.listen(3000, async () => {
  console.log("Admin Server is running");
  try {
    await connect();
  } catch (e) {
    console.log("Error in connecting database");
    console.log(e);
  }
});
