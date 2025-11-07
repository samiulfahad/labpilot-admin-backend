/** @format */

const express = require("express");
const router = express.Router();
const {
  createStaff,
  deactivateStaff,
  activateStaff,
  listStaffs,
  updateStaffAccess,
  deleteStaff,
} = require("../controller/labStaff");

// Route 1: Add staff
router.post("/add", createStaff);

// Route 2: Deactivate staff
router.patch("/deactivate", deactivateStaff);

// Route 3: Activate staff
router.patch("/activate", activateStaff);

// Route 4: Get all staffs
router.get("/all", listStaffs);

// Route 5: Edit staff
router.post("/edit/access", updateStaffAccess);

// Route 6: Delete Staff
router.delete("/delete", deleteStaff);

module.exports = router;
