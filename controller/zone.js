/** @format */

const Zone = require("../database/zone");

// Zone endpoints
const postZone = async (req, res, next) => {
  try {
    //console.log('postZone called');
    const systemId = 555;
    const { zoneName } = req.body;
    const zone = new Zone(zoneName, systemId);
    const zoneId = await zone.save();
    if (zoneId) {
      const newZone = {
        _id: zoneId,
        zoneName: req.body.zoneName,
        subZones: [],
      };
      return res.status(201).send({ success: true, zone: newZone });
    } else {
      return res
        .status(400)
        .send({ success: false, msg: "Failed to create zone" });
    }
  } catch (e) {
    next(e);
  }
};

const patchZone = async (req, res, next) => {
  try {
    const systemId = 555;
    const { zoneId, zoneName } = req.body;
    const success = await Zone.updateZoneById(zoneId, zoneName, systemId);
    if (success) {
      return res.status(200).send({ success: true, msg: "Zone updated" });
    } else {
      return res.status(400).send({ success: false, msg: "Zone not found" });
    }
  } catch (e) {
    next(e);
  }
};

const deleteZone = async (req, res, next) => {
  try {
    const systemId = 555;
    const { zoneId } = req.body;
    const success = await Zone.deleteZone(zoneId, systemId);
    if (success) {
      return res.status(200).send({ success: true, msg: "Zone deleted" });
    } else {
      return res
        .status(400)
        .send({ success: false, msg: "Zone not found or has associated labs" });
    }
  } catch (e) {
    next(e);
  }
};

const getZones = async (req, res, next) => {
  try {
    const zones = await Zone.getAllZones();
    if (zones.length >= 0) {
      return res.status(200).send({ success: true, zones });
    } else {
      return res.status(200).send({ success: false, message: "No Zone Found" });
    }
  } catch (e) {
    next(e);
  }
};

// SubZone endpoints
const postSubZone = async (req, res, next) => {
  try {
    const systemId = 555;
    const { zoneId, subZoneName } = req.body;
    const updatedDoc = await Zone.createSubZone(zoneId, subZoneName, systemId);
    if (updatedDoc) {
      return res.status(201).send(updatedDoc);
    } else {
      return res.status(400).send({ success: false, msg: "Zone not found" });
    }
  } catch (e) {
    next(e);
  }
};

const putSubZone = async (req, res, next) => {
  try {
    const systemId = 555;
    const { zoneId, subZoneId, subZoneName } = req.body;
    const success = await Zone.updateSubZone(
      zoneId,
      subZoneId,
      subZoneName,
      systemId
    );
    if (success) {
      return res.status(200).send({ success: true, msg: "Subzone updated" });
    } else {
      return res.status(400).send({ success: false, msg: "Subzone not found" });
    }
  } catch (e) {
    next(e);
  }
};

const deleteSubZone = async (req, res, next) => {
  try {
    const systemId = 555;
    const { zoneId, subZoneId } = req.body;
    const success = await Zone.deleteSubZone(zoneId, subZoneId, systemId);
    if (success) {
      return res.status(200).send({ success: true, msg: "Subzone deleted" });
    } else {
      return res
        .status(400)
        .send({
          success: false,
          msg: "Subzone not found or has associated labs",
        });
    }
  } catch (e) {
    next(e);
  }
};

const getZone = async (req, res, next) => {
  try {
    const zoneId = req.body.zoneId;
    const zone = await Zone.getZone(zoneId);
    if (zone) {
      return res.status(200).send({ success: true, zone });
    } else {
      return res
        .status(200)
        .send({ success: false, message: "Zone not found" });
    }
  } catch (e) {
    next(e);
  }
};

module.exports = {
  // Zone endpoints
  postZone,
  patchZone,
  deleteZone,
  getZones,
  getZone,

  // SubZone endpoints
  postSubZone,
  putSubZone,
  deleteSubZone,
};
