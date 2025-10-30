/** @format */

const { ObjectId, ClientSession } = require("mongodb");
const { getClient } = require("./connection");

const handleError = (e, methodName) => {
  console.log("Error Location: DB File (database > lab.js)");
  console.log(`Method Name: ${methodName}`);
  console.log(`Error Message: ${e.message}`);
  return null;
};

class Lab {
  constructor(labName, labId, address, zoneId, subZoneId, contact1, contact2, email, isActive, systemId) {
    this.labName = labName;
    this.labId = labId;
    this.address = address;
    this.contact1 = contact1.toString();
    this.contact2 = contact2.toString();
    this.email = email;
    this.isActive = isActive;
    this.zoneId = new ObjectId(zoneId); // ✅ Consistent ObjectId
    this.subZoneId = new ObjectId(subZoneId); // ✅ Consistent ObjectId
    this.labIncentive = 4;
    this.invoicePrice = 10;
    this.hasWarning = false;
    this.warning = "";
    this.totalReceipt = 0;
    this.payableAmount = 0;
    this.billingHistory = [];
    this.staffs = [];
    this.admins = [];
    this.referrers = [];
    this.testList = [];
    this.createdBy = systemId;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.isDeleted = false; // For soft delete
  }

  // Function 1: Save new lab to database
  async save() {
    try {
      const db = getClient();

      // Check if labId already exists
      const existingLab = await db.collection("labs").findOne({ labId: this.labId });
      if (existingLab) {
        return { duplicate: true };
      }

      const result = await db.collection("labs").insertOne(this);

      if (result.insertedId) {
        // Fetch the inserted lab with projection
        const projection = {
          labName: 1,
          labId: 1,
          address: 1,
          email: 1,
          contact1: 1,
          contact2: 1,
          zoneId: 1,
          subZoneId: 1,
          isActive: 1,
          createdAt: 1,
        };

        const insertedLab = await db.collection("labs").findOne({ _id: result.insertedId }, { projection });

        return {
          success: true,
          insertedId: result.insertedId,
          lab: insertedLab,
        };
      } else {
        return { success: false };
      }
    } catch (e) {
      return handleError(e, "save");
    }
  }

  // Function 2: Update Lab
  static async updateById(_id, newData, systemId) {
    try {
      const db = getClient();

      // Create a copy of newData to avoid modifying the original
      const updateData = { ...newData };

      // Convert zoneId and subZoneId to ObjectId if present and valid
      if (updateData.zoneId && typeof updateData.zoneId === "string") {
        updateData.zoneId = new ObjectId(updateData.zoneId);
      }
      if (updateData.subZoneId && typeof updateData.subZoneId === "string") {
        updateData.subZoneId = new ObjectId(updateData.subZoneId);
      }

      const updateFields = {
        ...updateData,
        updatedAt: new Date(),
        updatedBy: systemId,
      };

      const result = await db
        .collection("labs")
        .updateOne({ _id: new ObjectId(_id), isDeleted: { $ne: true } }, { $set: updateFields });

      return result.modifiedCount > 0;
    } catch (e) {
      return handleError(e, "updateLab");
    }
  }

  // Function 3: Soft delete - mark as deleted without actually removing
  static async deleteById(_id, systemId) {
    try {
      const db = getClient();

      const result = await db.collection("labs").updateOne(
        { _id: new ObjectId(_id), isDeleted: { $ne: true } },
        {
          $set: {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: systemId,
            updatedAt: new Date(),
            updatedBy: systemId,
          },
        }
      );

      return result.modifiedCount > 0;
    } catch (e) {
      return handleError(e, "softDeleteById");
    }
  }
  // Function 3b: Hard delete - completely remove from database
  static async removeById(_id) {
    try {
      const db = getClient();

      const result = await db.collection("labs").deleteOne({ _id: new ObjectId(_id) });
      return result.deletedCount > 0;
    } catch (e) {
      return handleError(e, "removeById");
    }
  }

  // Function 4: Search / Find labs by field (by Lab Id, email, contact, zone id, subzone id)
  static async find(field, value) {
    try {
      const projection = {
        _id: 0,
        labName: 1,
        labId: 1,
        address: 1,
        email: 1,
        contact1: 1,
        contact2: 1,
        zoneId: 1,
        subZoneId: 1,
        isActive: 1,
        createdAt: 1,
      };

      const db = getClient();

      let query = { isDeleted: { $ne: true } };

      // Handle ObjectId conversion for specific fields
      if (field === "zoneId" || field === "subZoneId") {
        query[field] = new ObjectId(value);
      }
      // Handle contact search - search both contact1 and contact2 fields
      else if (field === "contact") {
        query.$or = [{ contact1: value }, { contact2: value }];
      }
      // Default case for other fields
      else {
        query[field] = value;
      }
      //  console.log(query);
      const labs = await db.collection("labs").find(query).project(projection).toArray();
      return labs; // ✅ Always return array (empty if no results)
    } catch (e) {
      return handleError(e, "find");
    }
  }

  // Function 5: Find all labs (non-deleted only)
  static async findAll() {
    try {
      const projection = {
        labName: 1,
        labId: 1,
        address: 1,
        email: 1,
        contact1: 1,
        contact2: 1,
        zoneId: 1,
        subZoneId: 1,
        isActive: 1,
        createdAt: 1,
      };

      const db = getClient();
      const labs = await db
        .collection("labs")
        .find({ isDeleted: { $ne: true } })
        .project(projection)
        .toArray();

      return labs; // ✅ Always return array
    } catch (e) {
      return handleError(e, "findAll");
    }
  }

  // Function 6: Restore soft-deleted lab
  static async restore(labId, systemId) {
    try {
      const db = getClient();

      const result = await db.collection("labs").updateOne(
        { labId: labId, isDeleted: true },
        {
          $set: {
            isDeleted: false,
            restoredAt: new Date(),
            restoredBy: systemId,
            updatedAt: new Date(),
            updatedBy: systemId,
          },
          $unset: {
            deletedAt: "",
            deletedBy: "",
          },
        }
      );

      return result.modifiedCount > 0;
    } catch (e) {
      return handleError(e, "restore");
    }
  }

  // Function 11: Get lab statistics
  static async getStats() {
    try {
      const db = getClient();

      const totalLabs = await db.collection("labs").countDocuments({ isDeleted: { $ne: true } });
      const activeLabs = await db.collection("labs").countDocuments({
        isActive: true,
        isDeleted: { $ne: true },
      });
      const inactiveLabs = await db.collection("labs").countDocuments({
        isActive: false,
        isDeleted: { $ne: true },
      });
      const deletedLabs = await db.collection("labs").countDocuments({ isDeleted: true });

      // Count labs by zone
      const labsByZone = await db
        .collection("labs")
        .aggregate([{ $match: { isDeleted: { $ne: true } } }, { $group: { _id: "$zoneId", count: { $sum: 1 } } }])
        .toArray();

      return {
        totalLabs,
        activeLabs,
        inactiveLabs,
        deletedLabs,
        labsByZone,
      };
    } catch (e) {
      return handleError(e, "getStats");
    }
  }

  // Function 12: Check if labId exists
  static async labIdExists(labId) {
    try {
      const db = getClient();
      const existingLab = await db.collection("labs").findOne({
        labId: labId,
        isDeleted: { $ne: true },
      });
      return !!existingLab;
    } catch (e) {
      return handleError(e, "labIdExists");
    }
  }
}
module.exports = Lab;
