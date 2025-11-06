/** @format */

const express = require("express");
const router = express.Router();
const {
  createStaff,
  deactivateStaff,
  activateStaff,
  listStaffs,
  updateStaff,
  deleteStaff,
} = require("../controller/labStaff");

// Route 1: Add staff
router.post("/staff/add", createStaff);

// Route 2: Deactivate staff
router.patch("/staff/deactivate", deactivateStaff);

// Route 3: Activate staff
router.patch("/staff/activate", activateStaff);

// Route 4: Get all staffs
router.get("/staff/all", listStaffs);

// Route 5: Edit staff
router.post("/staff/edit", updateStaff);

// Route 6: Delete Staff
router.delete("/staff/delete", deleteStaff);

module.exports = router;
