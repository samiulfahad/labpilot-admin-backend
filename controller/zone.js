/** @format */

const Zone = require("../database/zone");

// Function 1: Create a zone
const postZone = async (req, res, next) => {
  try {
    //console.log('postZone called');
    const systemId = 555;
    const { zoneName } = req.body;
    const zone = new Zone(zoneName, systemId);
    const result = await zone.save();
    if (result.zoneId) {
      const newZone = {
        _id: result.zoneId,
        zoneName: req.body.zoneName,
        subZones: [],
      };
      return res.status(201).send({ success: true, zone: newZone });
    } else if (result.duplicate) {
      return res.status(400).send({ duplicate: true });
    } else {
      return res.status(400).send({ success: false, msg: "Failed to create zone" });
    }
  } catch (e) {
    next(e);
  }
};

// Function 2: Get a zone (with its subzones)
const getZone = async (req, res, next) => {
  try {
    const _id = req.body.zoneId;
    const zone = await Zone.find(_id);
    if (zone) {
      return res.status(200).send({ success: true, zone });
    } else {
      return res.status(200).send({ success: false, message: "Zone not found" });
    }
  } catch (e) {
    next(e);
  }
};

// Function 3: Get all zones (with its subzones)
const getAllZones = async (req, res, next) => {
  try {
    const zones = await Zone.findAll();
    if (zones.length >= 0) {
      return res.status(200).send({ success: true, zones });
    } else {
      return res.status(200).send({ success: false, message: "No Zone Found" });
    }
  } catch (e) {
    next(e);
  }
};

// Function 4: Update a zone
const patchZone = async (req, res, next) => {
  try {
    const systemId = 555;
    const { zoneId, zoneName } = req.body;
    const result = await Zone.update(zoneId, zoneName, systemId);
    if (result.success) {
      return res.status(200).send({ success: true, msg: "Zone updated" });
    } else if (result.duplicate) {
      return res.status(400).send({ duplicate: true });
    } else {
      return res.status(400).send({ success: false, msg: "Zone not found" });
    }
  } catch (e) {
    next(e);
  }
};

// Function 5: Delete a zone (with its subzones)
const deleteZone = async (req, res, next) => {
  try {
    const systemId = 555;
    const _id = req.body.zoneId;
    const success = await Zone.delete(_id, systemId);
    if (success) {
      return res.status(200).send({ success: true, msg: "Zone deleted" });
    } else {
      return res.status(400).send({ success: false, msg: "Zone not found or has associated labs" });
    }
  } catch (e) {
    next(e);
  }
};

// Function 6: Create a subzone
const postSubZone = async (req, res, next) => {
  try {
    const systemId = 555;
    const { zoneId, subZoneName } = req.body;
    const result = await Zone.createSubZone(zoneId, subZoneName, systemId);
    if (result.success) {
      return res.status(201).send(result.zone);
    } else if (result.duplicate) {
      return res.status(400).send({ duplicate: true });
    } else {
      return res.status(400).send({ success: false, msg: "Sub zone was not created" });
    }
  } catch (e) {
    next(e);
  }
};

// Function 7: Update a subzone
const patchSubZone = async (req, res, next) => {
  try {
    const systemId = 555;
    const { zoneId, subZoneId, subZoneName } = req.body;
    const result = await Zone.updateSubZone(zoneId, subZoneId, subZoneName, systemId);
    if (result.success) {
      return res.status(200).send(result.zone);
    } else if (result.duplicate) {
      return res.status(400).send({ duplicate: true });
    } else {
      return res.status(400).send({ success: false, msg: "Subzone not found" });
    }
  } catch (e) {
    next(e);
  }
};

// Function 8: Create a subzone
const deleteSubZone = async (req, res, next) => {
  try {
    const systemId = 555;
    const { zoneId, subZoneId } = req.body;
    const success = await Zone.deleteSubZone(zoneId, subZoneId, systemId);
    if (success) {
      return res.status(200).send({ success: true, msg: "Subzone deleted" });
    } else {
      return res.status(400).send({
        success: false,
        msg: "Subzone not found or has associated labs",
      });
    }
  } catch (e) {
    next(e);
  }
};

module.exports = {
  // Zone endpoints
  postZone,
  getZone,
  getAllZones,
  patchZone,
  deleteZone,

  // SubZone endpoints
  postSubZone,
  patchSubZone,
  deleteSubZone,
};
