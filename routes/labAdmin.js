const express = require("express");
const router = express.Router();
const labAdmin = require("../controller/labAdmin");

// Create a admin
router.post("/add", labAdmin.postAdmin);



module.exports = router;
