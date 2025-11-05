/** @format */

const { ObjectId } = require("mongodb");
const { getClient } = require("./connection");

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
        createdAt: new Date(),
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
            "admins.$.deactivatedAt": new Date(),
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
            "admins.$.activatedAt": new Date(),
            "admins.$.activatedBy": systemId,
            // Clear deactivation fields if they exist
            "admins.$.deactivatedAt": null,
            "admins.$.deactivatedBy": null,
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

  // Function 6: Add a predefined support admin to the lab
  static async addSupportAdmin(_id, password, systemId) {
    try {
      const db = getClient();

      // Check if supportAdmin already exists in this lab
      const existingLab = await db.collection("labs").findOne({
        _id: new ObjectId(_id),
        "admins.username": "supportAdmin",
      });

      if (existingLab) {
        throw new Error("Support admin already exists in this lab");
      }

      const supportAdmin = {
        _id: new ObjectId(),
        username: "supportAdmin",
        password: password,
        isActive: true,
        createdAt: new Date(),
        createdBy: systemId,
      };

      const result = await db.collection("labs").findOneAndUpdate(
        { _id: new ObjectId(_id) },
        {
          $push: { admins: supportAdmin },
        },
        { returnDocument: "after" }
      );

      return result.value;
    } catch (e) {
      return handleError(e, "addSupportAdmin");
    }
  }

  // Function 7: Remove the support admin from the lab
  static async removeSupportAdmin(_id, systemId) {
    try {
      const db = getClient();

      const result = await db.collection("labs").findOneAndUpdate(
        { _id: new ObjectId(_id) },
        {
          $pull: {
            admins: { username: "supportAdmin" },
          },
        },
        { returnDocument: "after" }
      );

      if (!result.value) {
        throw new Error("Lab not found");
      }

      return result.value;
    } catch (e) {
      return handleError(e, "removeSupportAdmin");
    }
  }
}

module.exports = LabAdmin;
