/** @format */

const { ObjectId } = require("mongodb");
const { getClient } = require("./connection");
const getGMT = require('../helper/getGMT');

const handleError = (e, methodName) => {
  console.log("Error Location: DB File (database > labAdmin.js)");
  console.log(`Method Name: ${methodName}`);
  console.log(`Error Message: ${e.message}`);
  return { success: false };
};


class LabAdmin {
  // Function 1: Add a new admin to the lab with duplicate checking
  static async add(_id, adminData, systemId) {
    try {
      const db = getClient();

      // Duplicate check - FIXED: changed __id to _id
      const existingLab = await db.collection("labs").findOne({
        _id: new ObjectId(_id), // FIXED: single underscore _id
        $or: [
          { "admins.username": adminData.username },
          { "admins.email": adminData.email },
          { "admins.phone": adminData.phone },
        ],
      });

      if (existingLab) {
        const existingAdmin = existingLab.admins.find(
          (a) => a.username === adminData.username || a.email === adminData.email || a.phone === adminData.phone
        );

        const duplicateFields = [];
        if (existingAdmin.username === adminData.username) duplicateFields.push("username");
        if (existingAdmin.email === adminData.email) duplicateFields.push("email");
        if (existingAdmin.phone === adminData.phone) duplicateFields.push("phone");

        return {
          success: false,
          duplicate: true,
          message: `Duplicate values found: ${duplicateFields.join(", ")} already exists in this lab`,
        };
      }

      // Admin object
      const admin = {
        _id: new ObjectId(),
        username: adminData.username,
        password: adminData.password,
        email: adminData.email,
        phone: adminData.phone,
        isActive: true,
        createdAt: getGMT(),
        createdBy: systemId,
      };

      const updatedDoc = await db.collection("labs").findOneAndUpdate(
        { _id: new ObjectId(_id) },
        { $push: { admins: admin } },
        {
          returnDocument: "after",
          projection: { admins: 1, _id: 0 },
          includeResultMetadata: false,
        }
      );

      if (!updatedDoc) {
        return { success: false, message: "Lab not found" };
      }

      // Extract the newly added admin from updated array
      const newAdmin = updatedDoc.admins.find((a) => a._id.equals(admin._id));

      const responseAdmin = {
        _id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
        phone: newAdmin.phone,
        isActive: newAdmin.isActive,
      };

      return {
        success: true,
        message: "Admin added successfully",
        admin: responseAdmin,
      };
    } catch (e) {
      return handleError(e, "add");
    }
  }

  // Function 2: Deactivate admin
  static async deactivate(_id, adminId, systemId) {
    try {
      const db = getClient();

      const result = await db.collection("labs").updateOne(
        {
          _id: new ObjectId(_id),
          "admins._id": new ObjectId(adminId),
        },
        {
          $set: {
            "admins.$.isActive": false,
            "admins.$.deactivatedAt": getGMT(),
            "admins.$.deactivatedBy": systemId,
          },
        }
      );

      // console.log(result);

      if (result.matchedCount === 0) {
        return { success: false, message: "Admin not found" };
      }

      if (result.modifiedCount === 1) {
        return {
          success: true,
          message: "Admin deactivated successfully",
          adminId: adminId,
        };
      } else {
        return {
          success: false,
          message: "Admin was found but not modified",
        };
      }
    } catch (e) {
      return handleError(e, "deactivateAdmin");
    }
  }

  // Function 3: Activate a deactivated admin
  static async activate(_id, adminId, systemId) {
    try {
      const db = getClient();

      const result = await db.collection("labs").updateOne(
        {
          _id: new ObjectId(_id),
          "admins._id": new ObjectId(adminId),
        },
        {
          $set: {
            "admins.$.isActive": true,
            "admins.$.activatedAt": getGMT(),
            "admins.$.activatedBy": systemId
          },
        }
      );

      // console.log(result);

      if (result.matchedCount === 0) {
        return { success: false, message: "Admin not found" };
      }

      if (result.modifiedCount === 1) {
        return {
          success: true,
          message: "Admin activated successfully",
          adminId: adminId,
        };
      } else {
        return {
          success: false,
          message: "Admin was found but not modified",
        };
      }
    } catch (e) {
      return handleError(e, "activateAdmin");
    }
  }

  // Function 4: Delete an admin completely from the lab
  static async delete(_id, adminId, systemId) {
    try {
      const db = getClient();

      const result = await db.collection("labs").updateOne(
        {
          _id: new ObjectId(_id),
          "admins._id": new ObjectId(adminId),
        },
        {
          $pull: {
            admins: { _id: new ObjectId(adminId) },
          },
        }
      );

      // console.log(result);
      // Return true if admin was found and removed, false otherwise
      return result.modifiedCount === 1 ? { success: true, adminId: adminId } : { success: false };
    } catch (e) {
      return handleError(e, "delete");
    }
  }

  // Function 5: Get all admins for a lab
  static async getAll(labObjId) {
    try {
      const db = getClient();

      const lab = await db.collection("labs").findOne(
        { _id: new ObjectId(labObjId) },
        {
          projection: {
            admins: {
              username: 1,
              email: 1,
              isActive: 1,
              _id: 1,
            },
          },
        }
      );

      if (lab?.admins) {
        return { success: true, admins: lab.admins };
      } else {
        return { success: false };
      }
    } catch (e) {
      return handleError(e, "getAll");
    }
  }

  // Function 6: Add Support Admin only if doesn't exist
  static async addSupportAdmin(_id, password, systemId) {
    try {
      const db = getClient();

      // First check if support admin already exists
      const existingLab = await db.collection("labs").findOne(
        {
          _id: new ObjectId(_id),
          "admins.username": "supportAdmin",
        },
        { projection: { "admins.$": 1 } }
      );

      if (existingLab && existingLab.admins && existingLab.admins.length > 0) {
        return {
          success: false,
          message: "Support admin already exists",
        };
      }

      // Create new support admin
      const supportAdminData = {
        _id: new ObjectId(),
        username: "supportAdmin",
        password: password, // Make sure to hash this password before storing
        isActive: true,
        createdAt: getGMT(),
        createdBy: systemId,
      };

      const result = await db.collection("labs").updateOne(
        { _id: new ObjectId(_id) },
        {
          $push: { admins: supportAdminData },
        }
      );

      if (result.matchedCount === 0) {
        return {
          success: false,
          message: "Lab not found",
        };
      }

      // Return success response
      return {
        success: true,
        message: "Support admin added successfully",
      };
    } catch (e) {
      return handleError(e, "addSupportAdmin");
    }
  }

  // Function 7: Activate Support Admin with new password
  static async activateSupportAdmin(_id, password, systemId) {
    try {
      const db = getClient();

      const result = await db.collection("labs").updateOne(
        {
          _id: new ObjectId(_id),
          "admins.username": "supportAdmin",
        },
        {
          $set: {
            "admins.$.password": password,
            "admins.$.isActive": true,
            "admins.$.lastActivatedAt": getGMT(),
            "admins.$.activatedBy": systemId,
          },
          $inc: { "admins.$.accessCount": 1 },
        }
      );
      console.log(result.modifiedCount);
      if (result.modifiedCount === 1) {
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (e) {
      return handleError(e, "activateSupportAdmin");
    }
  }

  // Function 8: Deactivate Support Admin
  static async deactivateSupportAdmin(_id, systemId) {
    try {
      const db = getClient();

      const result = await db.collection("labs").updateOne(
        {
          _id: new ObjectId(_id),
          "admins.username": "supportAdmin",
        },
        {
          $set: {
            "admins.$.isActive": false,
            "admins.$.deactivatedBy": systemId,
            "admins.$.deactivatedAt": getGMT(),
          },
        }
      );

      // console.log(result.modifiedCount);
      if (result.modifiedCount === 1) {
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (e) {
      return handleError(e, "deactivateSupportAdmin");
    }
  }
}

module.exports = LabAdmin;
