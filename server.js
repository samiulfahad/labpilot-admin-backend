/** @format */

const express = require("express");
const cors = require("cors");
const { connect } = require("./database/connection");

// Controller
const labController = require('./controller/lab')
const zoneController = require('./controller/zone')


// Data validation Rules
const { labAccountValidationRules, validateLabId } = require("./validation/labAccount")
const { searchLabValidationRules } = require("./validation/labSearch")
const { validateMongoId } = require("./validation/mongoId")
const handleValidationErrors = require("./validation/handleValidationErrors");

const app = express();

//Middlewares
app.use(express.json({ limit: "10kb" }));
const corsOptions = {
    origin: "http://localhost:5173", // Allow only your frontend
    credentials: true, // Allow cookies and authorization headers
};

app.use(cors(corsOptions));

app.get("/", (req, res, next) => {
    res.status(200).send({ success: true, msg: "Admin Server is running" });
});



// Register a new lab
app.post("/api/v1/system/lab/add",
    labAccountValidationRules,
    handleValidationErrors,
    labController.postLab
)

// Search a lab
app.get("/api/v1/system/lab/search",
    searchLabValidationRules,
    handleValidationErrors,
    labController.getLab
)

// Get labs by zone and subzone 
app.post("/api/v1/system/lab/zoneId",
    validateMongoId('zoneId', 'Zone ID'),
    handleValidationErrors,
    labController.getLabsByZoneId)

app.post("/api/v1/system/lab/subZoneId",
    validateMongoId('subZoneId', 'Sub Zone ID'),
    handleValidationErrors,
    labController.getLabsBySubZoneId)

// List of all labs
app.get("/api/v1/system/lab/all", labController.getAllLabs)

// Edit lab data
app.patch("/api/v1/system/lab/edit",
    labAccountValidationRules,
    handleValidationErrors,
    labController.patchLab
)

// delete a lab
app.delete("/api/v1/system/lab/delete",
    validateLabId,
    handleValidationErrors,
    labController.deleteLab
)

// Lab Zone routes
app.post("/api/v1/labzone/add", zoneController.postZone)
app.patch("/api/v1/labzone/edit", zoneController.patchZone)
app.delete("/api/v1/labzone/delete", zoneController.deleteZone)
app.get("/api/v1/labzone/all", zoneController.getZones)
app.get("/api/v1/labzone/", zoneController.getZone)

// Lab Sub Zone routes
app.post("/api/v1/labzone/subzone/add", zoneController.postSubZone)
app.put("/api/v1/labzone/subzone/edit", zoneController.putSubZone)
app.delete("/api/v1/labzone/subzone/delete", zoneController.deleteSubZone)




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
    console.log("######## Centrall Error Handler #########");
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
