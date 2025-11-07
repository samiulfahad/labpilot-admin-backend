/** @format */

const { ObjectId } = require("mongodb");
const { getClient } = require("./connection");
const getGMT = require("../helper/getGMT")

const handleError = (e, methodName) => {
  console.log("Error Location: DB File (database > lab.js)");
  console.log(`Method Name: ${methodName}`);
  console.log(`Error Message: ${e.message}`);
  return null;
};

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

class Lab {
  constructor(labName, labId, address, contact1, contact2, email, isActive, zoneId, subZoneId, systemId) {
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
    this.createdAt = getGMT();
    this.updatedAt = getGMT();
  }

  // Function 1: Create a new lab
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
        const insertedLab = await db.collection("labs").findOne({ _id: result.insertedId }, { projection });
        // console.log(insertedLab);
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

  // Function 2: Get a lab (Search  by Lab Id, email, contact, zone id, subzone id)
  static async find(field, value) {
    try {
      const db = getClient();
      let query = {};

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

  // Function 3: Get all labs
  static async findAll() {
    try {
      const db = getClient();
      const labs = await db.collection("labs").find({}).project(projection).toArray();
      return labs; // ✅ Always return array
    } catch (e) {
      return handleError(e, "findAll");
    }
  }

  // Function 4: Update a Lab
  static async update(_id, newData, systemId) {
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
        updatedAt: getGMT(),
        updatedBy: systemId,
      };

      const result = await db.collection("labs").updateOne({ _id: new ObjectId(_id) }, { $set: updateFields });

      return result.modifiedCount > 0;
    } catch (e) {
      return handleError(e, "updateLab");
    }
  }

  // Function 5: Delete Lab - completely remove from database
  static async delete(_id) {
    try {
      const db = getClient();

      const result = await db.collection("labs").deleteOne({ _id: new ObjectId(_id) });
      return result.deletedCount > 0;
    } catch (e) {
      return handleError(e, "deleteById");
    }
  }
}
module.exports = Lab;
