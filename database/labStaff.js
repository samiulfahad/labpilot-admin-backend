/** @format */

const { ObjectId } = require("mongodb");
const { getClient } = require("./connection");
const getGMT = require("../helper/getGMT");

const handleError = (e, methodName) => {
  console.log("Error Location: DB File (database > labStaff.js)");
  console.log(`Method Name: ${methodName}`);
  console.log(`Error Message: ${e.message}`);
  return { success: false };
};

class LabStaff {
  // Function 1: Add a new staff to the lab with duplicate checking
  static async add(_id, staffData, systemId) {
    try {
      const db = getClient();

      // Duplicate check
      const existingLab = await db.collection("labs").findOne({
        _id: new ObjectId(_id),
        $or: [
          { "staffs.username": staffData.username },
          { "staffs.email": staffData.email },
          { "staffs.phone": staffData.phone },
        ],
      });

      if (existingLab) {
        const existingStaff = existingLab.staffs.find(
          (s) => s.username === staffData.username || s.email === staffData.email || s.phone === staffData.phone
        );

        const duplicateFields = [];
        if (existingStaff.username === staffData.username) duplicateFields.push("username");
        if (existingStaff.email === staffData.email) duplicateFields.push("email");
        if (existingStaff.phone === staffData.phone) duplicateFields.push("phone");

        return {
          success: false,
          duplicate: true,
          message: `${duplicateFields.join(", ")} already exists in this lab`,
        };
      }

      // Staff object
      const staff = {
        _id: new ObjectId(),
        name: staffData.name,
        username: staffData.username,
        password: staffData.password,
        email: staffData.email,
        phone: staffData.phone,
        access: staffData.access || [],
        isActive: staffData.isActive,
        createdAt: getGMT(),
        createdBy: systemId,
      };

      const updatedDoc = await db.collection("labs").findOneAndUpdate(
        { _id: new ObjectId(_id) },
        { $push: { staffs: staff } },
        {
          returnDocument: "after",
          projection: { staffs: 1, _id: 0 },
          includeResultMetadata: false,
        }
      );

      if (!updatedDoc) {
        return { success: false, message: "Lab not found" };
      }

      // Extract the newly added staff from updated array
      const newStaff = updatedDoc.staffs.find((s) => s._id.equals(staff._id));

      const responseStaff = {
        _id: newStaff._id,
        name: newStaff.name,
        username: newStaff.username,
        email: newStaff.email,
        phone: newStaff.phone,
        access: newStaff.access,
        isActive: newStaff.isActive,
      };

      return {
        success: true,
        message: "Staff added successfully",
        staff: responseStaff,
      };
    } catch (e) {
      return handleError(e, "add");
    }
  }

  // Function 2: Deactivate staff
  static async deactivate(_id, staffId, systemId) {
    try {
      const db = getClient();

      const result = await db.collection("labs").updateOne(
        {
          _id: new ObjectId(_id),
          "staffs._id": new ObjectId(staffId),
        },
        {
          $set: {
            "staffs.$.isActive": false,
            "staffs.$.deactivatedAt": getGMT(),
            "staffs.$.deactivatedBy": systemId,
          },
        }
      );

      if (result.matchedCount === 0) {
        return { success: false, message: "Staff not found" };
      }

      if (result.modifiedCount === 1) {
        return {
          success: true,
          message: "Staff deactivated successfully",
          staffId: staffId,
        };
      } else {
        return {
          success: false,
          message: "Staff was found but not modified",
        };
      }
    } catch (e) {
      return handleError(e, "deactivate");
    }
  }

  // Function 3: Activate a deactivated staff
  static async activate(_id, staffId, systemId) {
    try {
      const db = getClient();

      const result = await db.collection("labs").updateOne(
        {
          _id: new ObjectId(_id),
          "staffs._id": new ObjectId(staffId),
        },
        {
          $set: {
            "staffs.$.isActive": true,
            "staffs.$.activatedAt": getGMT(),
            "staffs.$.activatedBy": systemId,
          },
        }
      );

      if (result.matchedCount === 0) {
        return { success: false, message: "Staff not found" };
      }

      if (result.modifiedCount === 1) {
        return {
          success: true,
          message: "Staff activated successfully",
          staffId: staffId,
        };
      } else {
        return {
          success: false,
          message: "Staff was found but not modified",
        };
      }
    } catch (e) {
      return handleError(e, "activate");
    }
  }

  // Function 4: Delete a staff completely from the lab
  static async delete(_id, staffId, systemId) {
    try {
      const db = getClient();

      const result = await db.collection("labs").updateOne(
        {
          _id: new ObjectId(_id),
          "staffs._id": new ObjectId(staffId),
        },
        {
          $pull: {
            staffs: { _id: new ObjectId(staffId) },
          },
        }
      );

      return result.modifiedCount === 1 ? { success: true, staffId: staffId } : { success: false };
    } catch (e) {
      return handleError(e, "delete");
    }
  }

  // Function 5: Get all staffs for a lab
  static async getAll(labObjId) {
    try {
      const db = getClient();

      const lab = await db.collection("labs").findOne(
        { _id: new ObjectId(labObjId) },
        {
          projection: {
            staffs: {
              name: 1,
              username: 1,
              email: 1,
              phone: 1,
              access: 1,
              isActive: 1,
              _id: 1,
            },
          },
        }
      );

      if (lab?.staffs) {
        return { success: true, staffs: lab.staffs };
      } else {
        return { success: false, message: "No staffs found" };
      }
    } catch (e) {
      return handleError(e, "getAll");
    }
  }

  // Function 6: Update Staff access
  static async updateAccess(_id, staffId, staffAccess, systemId) {
    try {
      const db = getClient();

      // First update the document
      const updateResult = await db.collection("labs").updateOne(
        {
          _id: new ObjectId(_id),
          "staffs._id": new ObjectId(staffId),
        },
        {
          $set: {
            "staffs.$.access": staffAccess,
            "staffs.$.updatedAt": getGMT(),
            "staffs.$.updatedBy": systemId,
          },
        }
      );

      if (updateResult.matchedCount === 0) {
        return {
          success: false,
          message: "Lab or staff not found",
        };
      }

      if (updateResult.modifiedCount === 0) {
        return {
          success: false,
          message: "Staff found but access was not modified",
        };
      }

      // Then fetch the updated staff member
      const lab = await db.collection("labs").findOne(
        {
          _id: new ObjectId(_id),
          "staffs._id": new ObjectId(staffId),
        },
        {
          projection: { "staffs.$": 1 },
        }
      );

      const updatedStaff = lab.staffs[0];

      const responseStaff = {
        _id: updatedStaff._id,
        name: updatedStaff.name,
        username: updatedStaff.username,
        email: updatedStaff.email,
        phone: updatedStaff.phone,
        access: updatedStaff.access,
        isActive: updatedStaff.isActive,
      };

      return {
        success: true,
        message: "Staff access updated successfully",
        staff: responseStaff,
      };
    } catch (e) {
      return handleError(e, "updateAccess");
    }
  }
}

module.exports = LabStaff;
