const LabStaff = require("../database/labStaff");

// Route 1: Add staff
const createStaff = async (req, res, next) => {
  try {
    const { _id, name, username, password, access, email, phone, isActive } = req.body;
    const staffData = { name, username, password, access, email, phone, isActive };
    const systemId = 555;

    // Fixed: Pass _id as first parameter, then staffData, then systemId
    const result = await LabStaff.add(_id, staffData, systemId);

    if (result.success) {
      return res.status(201).send(result.staff);
    } else if (result.duplicate) {
      return res.status(400).send({ duplicate: true, message: result.message });
    } else {
      return res.status(400).send({ success: false, message: result.message });
    }
  } catch (e) {
    next(e);
  }
};

// Route 2: Deactivate staff
const deactivateStaff = async (req, res, next) => {
  try {
    const { _id, staffId } = req.body;
    const systemId = 555;

    const result = await LabStaff.deactivate(_id, staffId, systemId);
    if (result.success) {
      return res.status(200).send({ success: true, staffId: result.staffId });
    } else {
      return res.status(400).send({ success: false, message: result.message });
    }
  } catch (e) {
    next(e);
  }
};

// Route 3: Activate staff
const activateStaff = async (req, res, next) => {
  try {
    const { _id, staffId } = req.body;
    const systemId = 555;

    const result = await LabStaff.activate(_id, staffId, systemId);
    if (result.success) {
      return res.status(200).send({ success: true, staffId: result.staffId });
    } else {
      return res.status(400).send({ success: false, message: result.message });
    }
  } catch (e) {
    next(e);
  }
};

// Route 4: Get all staffs
const listStaffs = async (req, res, next) => {
  try {
    const { _id } = req.body;

    const result = await LabStaff.getAll(_id);
    if (result.success) {
      return res.status(200).send(result.staffs);
    } else {
      return res.status(400).send({ success: false, message: result.message });
    }
  } catch (e) {
    next(e);
  }
};

// Route 5: Edit staff access
const updateStaffAccess = async (req, res, next) => {
  try {
    // Fixed: Added staffId to destructuring
    const { _id, staffId, access } = req.body;
    const systemId = 555;
    const result = await LabStaff.updateAccess(_id, staffId, access, systemId);

    if (result.success) {
      return res.status(200).send(result.staff);
    } else {
      return res.status(400).send({ success: false, message: result.message });
    }
  } catch (e) {
    next(e);
  }
};

// Route 6: Delete Staff
const deleteStaff = async (req, res, next) => {
  try {
    const { _id, staffId } = req.body;
    const systemId = 555;

    const result = await LabStaff.delete(_id, staffId, systemId);
    if (result.success) {
      return res.status(200).send({ success: true, staffId: result.staffId });
    } else {
      return res.status(400).send({ success: false, message: result.message });
    }
  } catch (e) {
    next(e);
  }
};

module.exports = {
  createStaff,
  deactivateStaff,
  activateStaff,
  listStaffs,
  updateStaffAccess,
  deleteStaff,
};
