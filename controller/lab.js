/** @format */

const Lab = require("../database/lab");

// Create a new Lab
const postLab = async (req, res, next) => {
  try {
    // Get systemId from authenticated user (from middleware)
    const systemId = req.user?.id || req.user?.systemId || 555; // Fallback for development
    const { labName, labId, address, zoneId, subZoneId, email, isActive, contact1, contact2 } = req.body;

    const lab = new Lab(labName, labId, address, zoneId, subZoneId, contact1, contact2, email, isActive, systemId);
    const result = await lab.save();

    if (result.success) {
      return res.status(201).send(result.lab);
    } else if (result.duplicate) {
      return res.status(400).send({ duplicate: true });
    } else {
      return res.status(400).send({ success: false, msg: "Failed to create lab" });
    }
  } catch (e) {
    next(e);
  }
};

// Lab Search (labId, email, contact, zone, subzone)
const getLab = async (req, res, next) => {
  try {
    const { field, value } = req.body;

    const labs = await Lab.find(field, value);
    if (labs && labs.length > 0) {
      return res.status(200).send({ success: true, labs, msg: "Labs found successfully" });
    } else {
      return res.status(200).send({ success: true, labs: [], msg: "No labs found" });
    }
  } catch (e) {
    next(e);
  }
};

// Get All Labs
const getAllLabs = async (req, res, next) => {
  try {
    const labs = await Lab.findAll();
    if (labs && labs.length > 0) {
      return res.status(200).send({ success: true, labs, msg: "Labs retrieved successfully" });
    } else {
      return res.status(200).send({ success: true, labs: [], msg: "No labs found" });
    }
  } catch (e) {
    next(e);
  }
};

// Update Lab by Lab ID
const patchLab = async (req, res, next) => {
  try {
    // Get systemId from authenticated user
    const systemId = req.user?.id || req.user?.systemId || 777;
    const { _id, labName, address, zoneId, subZoneId, contact1, contact2, email, isActive } = req.body;
    const newData = { labName, address, zoneId, subZoneId, contact1, contact2, email, isActive };

    const success = await Lab.updateById(_id, newData, systemId);
    if (success) {
      return res.status(200).send({ success: true, msg: "Lab updated successfully" });
    } else {
      return res.status(400).send({ success: false, msg: "Lab not found or no changes made" });
    }
  } catch (e) {
    next(e);
  }
};

// Delete Lab by Lab ID
const deleteLab = async (req, res, next) => {
  try {
    // Get systemId from authenticated user
    const systemId = req.user?.id || req.user?.systemId || 999;
    const { _id } = req.body;

    const success = await Lab.deleteById(_id, systemId);
    if (success) {
      return res.status(200).send({ success: true, msg: "Lab removed permanently" });
    } else {
      return res.status(400).send({ success: false, msg: "Lab not found or removal failed" });
    }
  } catch (e) {
    next(e);
  }
};



// Get Labs Statistics
const getLabStats = async (req, res, next) => {
  try {
    const db = getClient();

    const totalLabs = await db.collection("labs").countDocuments();
    const activeLabs = await db.collection("labs").countDocuments({ isActive: true });
    const inactiveLabs = await db.collection("labs").countDocuments({ isActive: false });

    // Count labs by zone (you might need to adjust based on your zone structure)
    const labsByZone = await db
      .collection("labs")
      .aggregate([{ $group: { _id: "$zoneId", count: { $sum: 1 } } }])
      .toArray();

    return res.status(200).send({
      success: true,
      stats: {
        totalLabs,
        activeLabs,
        inactiveLabs,
        labsByZone,
      },
      msg: "Statistics retrieved successfully",
    });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  postLab,
  getLab,
  getAllLabs,
  patchLab,
  deleteLab,
  getLabStats,
};
