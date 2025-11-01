/** @format */

const express = require("express");
const cors = require("cors");
const { connect } = require("./database/connection");

// Controller
const labController = require("./controller/lab");
const zoneController = require("./controller/zone");
const catController = require("./controller/category");
const testController = require("./controller/test");

// Data validation Rules
const { labValidationRules, validateLabId } = require("./validation/lab");
const { searchLabValidationRules } = require("./validation/searchLab");
const { subZoneValidationRules, zoneValidationRules } = require("./validation/zone");
const { validatePOSTTest, validatePATCHTest } = require("./validation/test");
const { validatePOSTCat, validatePATCHCat } = require("./validation/category");
const { validateMongoId, validateMongoIdIfProvided } = require("./validation/mongoId");
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

// Create a new lab
app.post("/api/v1/lab/add", labValidationRules, handleValidationErrors, labController.postLab);

// Get lab/s (Search by LabId, email, contact, zoneId, subZoneId)
app.get("/api/v1/lab/search", searchLabValidationRules, handleValidationErrors, labController.getLab);

// Get all labs
app.get("/api/v1/lab/all", labController.getAllLabs);

// Update lab data
app.patch(
  "/api/v1/lab/edit",
  labValidationRules,
  validateMongoId("_id", "lab ID"),
  handleValidationErrors,
  labController.patchLab
);

// Delete a lab permanently
app.delete("/api/v1/lab/delete", validateMongoId("_id", "Lab ID"), handleValidationErrors, labController.deleteLab);

// Add a new Zone
app.post("/api/v1/zone/add", zoneValidationRules, handleValidationErrors, zoneController.postZone);

// Get a zone
app.get("/api/v1/zone/", validateMongoId("zoneId", "Zone ID"), handleValidationErrors, zoneController.getZone);

// Get all zones
app.get("/api/v1/zone/all", zoneController.getAllZones);

// Update a zone
app.patch(
  "/api/v1/zone/edit",
  validateMongoId("zoneId", "Zone ID"),
  zoneValidationRules,
  handleValidationErrors,
  zoneController.patchZone
);

// Delete a zone
app.delete(
  "/api/v1/zone/delete",
  validateMongoId("zoneId", "Zone ID"),
  handleValidationErrors,
  zoneController.deleteZone
);

// Create a subzone
app.post("/api/v1/zone/subzone/add", subZoneValidationRules, handleValidationErrors, zoneController.postSubZone);

// Update a subzone
app.patch(
  "/api/v1/zone/subzone/edit",
  subZoneValidationRules,
  validateMongoId("subZoneId", "Sub Zone ID"),
  handleValidationErrors,
  zoneController.patchSubZone
);

// Delete a subzone
app.delete(
  "/api/v1/zone/subzone/delete",
  validateMongoId("zoneId", "Zone ID"),
  validateMongoId("subZoneId", "Sub Zone ID"),
  handleValidationErrors,
  zoneController.deleteSubZone
);

// Add a category
app.post("/api/v1/category/add", validatePOSTCat, handleValidationErrors, catController.postCategory);

// Get all categories
app.get("/api/v1/category/all", catController.getAllCategories);

// Edit a category
app.patch("/api/v1/category/edit", validatePATCHCat, handleValidationErrors, catController.patchCategory);

// Delete a category
app.delete(
  "/api/v1/category/delete",
  validateMongoId("_id", "Category ID"),
  handleValidationErrors,
  catController.deleteCategory
);

// Create a new test
app.post("/api/v1/test/add", validatePOSTTest, handleValidationErrors, testController.postTest);

// Get all tests
app.get(
  "/api/v1/test/all",
  validateMongoIdIfProvided("categoryId", "Category ID"),
  handleValidationErrors,
  testController.getAllTests
);

// Update a test
app.patch("/api/v1/test/edit", validatePATCHTest, handleValidationErrors, testController.patchTest);

// Delete a test
app.delete("/api/v1/test/delete", validateMongoId("_id", "Test ID"), handleValidationErrors, testController.deleteTest);

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
