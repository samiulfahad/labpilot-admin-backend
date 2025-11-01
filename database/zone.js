/** @format */

const { ObjectId } = require("mongodb");
const { getClient } = require("./connection");

const handleError = (e, methodName) => {
  console.log("Error Location: DB File (database > zone.js)");
  console.log(`Method Name: ${methodName}`);
  console.log(`Error Message: ${e.message}`);
  return null;
};

class Zone {
  constructor(zoneName, systemId) {
    this.zoneName = zoneName;
    this.subZones = [];
    this.createdBy = systemId;
    this.createdAt = new Date();
  }

  // Function 1: Create a new zone
  async save() {
    try {
      const db = getClient();

      // Check if zone name already exists
      const existingZone = await db.collection("zone").findOne({
        zoneName: this.zoneName,
      });

      if (existingZone) {
        return { duplicate: true };
      }

      const result = await db.collection("zone").insertOne(this);
      return result.insertedId ? { zoneId: result.insertedId } : false;
    } catch (e) {
      return handleError(e, "save");
    }
  }

  // Function 2: Get a zone (with subzones)
  static async find(_id) {
    try {
      const projection = {
        createdAt: 0,
        createdBy: 0,
        updatedAt: 0,
        updatedBy: 0,
      };
      const db = getClient();

      const zone = await db.collection("zone").findOne(
        { _id: new ObjectId(_id) },
        { projection } // ✅ Correct: projection as second parameter
      );

      return zone || null;
    } catch (e) {
      return handleError(e, "getZone"); // ✅ Fixed method name
    }
  }

  // Function 3: Get all zones with subzones
  static async findAll() {
    try {
      const projection = {
        createdAt: 0,
        createdBy: 0,
        updatedAt: 0,
        updatedBy: 0,
      };
      const db = getClient();
      const zones = await db.collection("zone").find({}).project(projection).toArray();
      if (zones && zones.length > 0) {
        return zones;
      } else {
        return [];
      }
    } catch (e) {
      return handleError(e, "getAllZones");
    }
  }

  // Function 4: Update Zone
  static async update(_id, zoneName, systemId) {
    try {
      const db = getClient();

      // Check if zone name already exists (excluding the current zone being updated)
      const existingZone = await db.collection("zone").findOne({
        zoneName: zoneName,
        _id: { $ne: new ObjectId(_id) }, // Exclude the current zone from the check
      });

      if (existingZone) {
        return { duplicate: true };
      }

      const result = await db.collection("zone").updateOne(
        { _id: new ObjectId(_id) },
        {
          $set: {
            zoneName: zoneName,
            updatedBy: systemId,
            updatedAt: new Date(),
          },
        }
      );

      return result.modifiedCount > 0 ? { success: true } : { success: false };
    } catch (e) {
      return handleError(e, "updateZone");
    }
  }

  // Function 5: Delete a zone (and all its subzones)
  static async delete(zoneId, systemId) {
    try {
      const db = getClient();

      // First, check if there are any labs associated with this zone
      const labsInZone = await db.collection("labs").findOne({
        zoneId: new ObjectId(zoneId),
      });

      if (labsInZone) {
        throw new Error("Cannot delete zone: There are labs associated with this zone");
      }

      // Delete the zone
      const result = await db.collection("zone").deleteOne({ _id: new ObjectId(zoneId) });

      return result.deletedCount > 0;
    } catch (e) {
      return handleError(e, "deleteZone");
    }
  }

  // Function 6: Create a subzone
  static async createSubZone(zoneId, subZoneName, systemId) {
    try {
      const db = getClient();

      // Check if subzone name already exists in this zone
      const existingSubZone = await db.collection("zone").findOne({
        _id: new ObjectId(zoneId),
        "subZones.subZoneName": subZoneName,
      });

      if (existingSubZone) {
        return { duplicate: true };
      }

      const subZone = {
        _id: new ObjectId(),
        subZoneName: subZoneName,
        createdAt: new Date(),
        createdBy: systemId,
      };

      const result = await db.collection("zone").findOneAndUpdate(
        { _id: new ObjectId(zoneId) },
        {
          $push: {
            subZones: subZone,
          },
          $set: {
            updatedAt: new Date(),
            updatedBy: systemId,
          },
        },
        {
          returnDocument: "after", // Returns the updated document
          includeResultMetadata: true, // Includes operation metadata
        }
      );

      if (!result.value) {
        return { success: false };
      }

      // Return the updated zone document with the new subzone
      return { success: true, zone: result.value };
    } catch (e) {
      return handleError(e, "createSubZone");
    }
  }

  // Function 7: Update sub zone name
  static async updateSubZone(zoneId, subZoneId, newSubZoneName, systemId) {
    try {
      const db = getClient();

      // Check if subzone name already exists in this zone (excluding the current subzone)
      const existingSubZone = await db.collection("zone").findOne({
        _id: new ObjectId(zoneId),
        subZones: {
          $elemMatch: {
            subZoneName: newSubZoneName,
            _id: { $ne: new ObjectId(subZoneId) },
          },
        },
      });

      if (existingSubZone) {
        return { duplicate: true };
      }

      const result = await db.collection("zone").findOneAndUpdate(
        {
          _id: new ObjectId(zoneId),
          "subZones._id": new ObjectId(subZoneId),
        },
        {
          $set: {
            "subZones.$.subZoneName": newSubZoneName,
            "subZones.$.updatedAt": new Date(),
            "subZones.$.updatedBy": systemId,
            updatedAt: new Date(),
            updatedBy: systemId,
          },
        },
        {
          returnDocument: "after", // Returns the updated document
          includeResultMetadata: true, // Includes operation metadata
        }
      );

      if (!result.value) {
        return { success: false, message: "Zone or subzone not found" };
      }

      // Return the updated zone document with the modified subzone
      return { success: true, zone: result.value };
    } catch (e) {
      return handleError(e, "updateSubZone");
    }
  }

  // Function 8: Update sub zone name
  static async deleteSubZone(zoneId, subZoneId, systemId) {
    try {
      const db = getClient();

      // Remove the subzone
      const result = await db.collection("zone").updateOne(
        {
          _id: new ObjectId(zoneId),
          "subZones._id": new ObjectId(subZoneId), // Added subzone existence check
        },
        {
          $pull: {
            subZones: { _id: new ObjectId(subZoneId) },
          },
          $set: {
            updatedAt: new Date(),
            updatedBy: systemId,
          },
        }
      );
      return result.modifiedCount > 0;
    } catch (e) {
      return handleError(e, "deleteSubZone");
    }
  }
}

module.exports = Zone;
