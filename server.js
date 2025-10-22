/** @format */

const express = require("express");
const cors = require("cors");
const { connect } = require("./database/connection");

// Controller
const labController = require('./controller/lab')
const zoneController = require('./controller/zone')


// Data validation Rules
const { labValidationRules, validateLabId } = require("./validation/lab")
const { searchLabValidationRules } = require("./validation/searchLab")
const { subZoneValidationRules, zoneValidationRules } = require("./validation/zone")
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
app.post("/api/v1/lab/add",
    labValidationRules, handleValidationErrors,
    labController.postLab
)
// Edit lab data
app.patch("/api/v1/lab/edit",
    labValidationRules, validateMongoId("_id", "lab ID"), handleValidationErrors,
    labController.patchLab
)

// Delete (soft) a lab
app.delete("/api/v1/lab/delete",
    validateMongoId("_id", "Lab ID"), handleValidationErrors,
    labController.deleteLab
)

// Remove or permanently delete a lab
app.delete("/api/v1/lab/remove",
    validateMongoId("_id", "Lab ID"), handleValidationErrors,
    labController.removeLab
)

// Restore a lab (by Lab Id )
app.patch("/api/v1/lab/restore",
    validateLabId, handleValidationErrors,
    labController.restoreLab
)

// Search lab (by Lab Id, email, contact, zone id, subzone id)
app.get("/api/v1/lab/search",
    searchLabValidationRules, handleValidationErrors,
    labController.getLab
)

// List of all labs
app.get("/api/v1/lab/all",
    labController.getAllLabs
)

// Lab Zone routes
app.post("/api/v1/zone/add",
    zoneValidationRules, handleValidationErrors,
    zoneController.postZone
)
app.patch("/api/v1/zone/edit",
    validateMongoId("zoneId", "Zone ID"), zoneValidationRules, handleValidationErrors,
    zoneController.patchZone
)
app.delete("/api/v1/zone/delete",
    validateMongoId("zoneId", "Zone ID"), handleValidationErrors,
    zoneController.deleteZone
)
app.get("/api/v1/zone/all",
    zoneController.getZones
)
app.get("/api/v1/labzone/",
    validateMongoId("zoneId", "Zone ID"), handleValidationErrors,
    zoneController.getZone
)

// Lab Sub Zone routes
app.post("/api/v1/labzone/subzone/add",
    subZoneValidationRules, handleValidationErrors,
    zoneController.postSubZone
)
app.put("/api/v1/labzone/subzone/edit",
    subZoneValidationRules, validateMongoId("subZoneId", "Sub Zone ID"), handleValidationErrors,
    zoneController.putSubZone
)
app.delete("/api/v1/labzone/subzone/delete",
    validateMongoId("zoneId", "Zone ID"), validateMongoId("subZoneId", "Sub Zone ID"), handleValidationErrors,
    zoneController.deleteSubZone
)


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
