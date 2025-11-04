const { ObjectId } = require("mongodb");
const { getClient } = require("./connection");

const handleError = (e, methodName) => {
  console.log("Error Location: DB File (database > labStaff.js)");
  console.log(`Method Name: ${methodName}`);
  console.log(`Error Message: ${e.message}`);
  return null;
};

class LabStaff {
  // Function 1: Add a new staff member to the lab with duplicate checking
  static async addStaff(_id, staffData, systemId) {
    try {
      const db = getClient();

      // Check if username, email, or phone already exists in this lab
      const existingLab = await db.collection("labs").findOne({
        _id: new ObjectId(_id),
        $or: [
          { "staffs.username": staffData.username },
          { "staffs.email": staffData.email },
          { "staffs.phone": staffData.phone },
        ],
      });

      if (existingLab) {
        // Check which field(s) are duplicate
        const existingStaff = existingLab.staffs.find(
          (staff) =>
            staff.username === staffData.username || staff.email === staffData.email || staff.phone === staffData.phone
        );

        const duplicateFields = [];
        if (existingStaff.username === staffData.username) duplicateFields.push("username");
        if (existingStaff.email === staffData.email) duplicateFields.push("email");
        if (existingStaff.phone === staffData.phone) duplicateFields.push("phone");

        throw new Error(`Duplicate values found: ${duplicateFields.join(", ")} already exists in this lab`);
      }

      const staff = {
        _id: new ObjectId(),
        username: staffData.username,
        password: staffData.password, // Hash this before calling
        email: staffData.email,
        phone: staffData.phone,
        fullName: staffData.fullName,
        designation: staffData.designation,
        access: staffData.access || [], // Array of access permissions
        isActive: true,
        joinDate: new Date(),
        createdAt: new Date(),
        createdBy: systemId,
      };

      const result = await db.collection("labs").findOneAndUpdate(
        { _id: new ObjectId(_id) },
        {
          $push: { staffs: staff },
        },
        { returnDocument: "after" }
      );

      return result.value;
    } catch (e) {
      return handleError(e, "addStaff");
    }
  }

  // Function 2: Temporarily deactivate a staff member
  static async deactivateStaff(_id, username, systemId) {
    try {
      const db = getClient();

      const result = await db.collection("labs").findOneAndUpdate(
        {
          _id: new ObjectId(_id),
          "staffs.username": username,
        },
        {
          $set: {
            "staffs.$.isActive": false,
            "staffs.$.deactivatedAt": new Date(),
            "staffs.$.deactivatedBy": systemId,
          },
        },
        { returnDocument: "after" }
      );

      if (!result.value) {
        throw new Error("Staff not found");
      }

      return result.value;
    } catch (e) {
      return handleError(e, "deactivateStaff");
    }
  }

  // Function 3: Reactivate a deactivated staff member
  static async activateStaff(_id, username, systemId) {
    try {
      const db = getClient();

      const result = await db.collection("labs").findOneAndUpdate(
        {
          _id: new ObjectId(_id),
          "staffs.username": username,
        },
        {
          $set: {
            "staffs.$.isActive": true,
            "staffs.$.activatedAt": new Date(),
            "staffs.$.activatedBy": systemId,
          },
        },
        { returnDocument: "after" }
      );

      if (!result.value) {
        throw new Error("Staff not found");
      }

      return result.value;
    } catch (e) {
      return handleError(e, "activateStaff");
    }
  }

  // Function 4: Permanently remove a staff member from the lab
  static async terminateStaff(_id, username, systemId) {
    try {
      const db = getClient();

      const result = await db.collection("labs").findOneAndUpdate(
        { _id: new ObjectId(_id) },
        {
          $pull: {
            staffs: { username: username },
          },
        },
        { returnDocument: "after" }
      );

      if (!result.value) {
        throw new Error("Lab not found");
      }

      return result.value;
    } catch (e) {
      return handleError(e, "terminateStaff");
    }
  }

  // Function 5: Update access permissions for a staff member
  static async updateStaffAccess(_id, username, access, systemId) {
    try {
      const db = getClient();

      const result = await db.collection("labs").findOneAndUpdate(
        {
          _id: new ObjectId(_id),
          "staffs.username": username,
        },
        {
          $set: {
            "staffs.$.access": access,
            "staffs.$.updatedAt": new Date(),
            "staffs.$.updatedBy": systemId,
          },
        },
        { returnDocument: "after" }
      );

      if (!result.value) {
        throw new Error("Staff not found");
      }

      return result.value;
    } catch (e) {
      return handleError(e, "updateStaffAccess");
    }
  }

  // Function 6: Get all staff members for a lab
  static async getStaffs(_id) {
    try {
      const db = getClient();

      const lab = await db.collection("labs").findOne({ _id: new ObjectId(_id) }, { projection: { staffs: 1 } });

      return lab?.staffs || [];
    } catch (e) {
      return handleError(e, "getStaffs");
    }
  }

  // Function 7: Update staff member details with duplicate checking
  static async updateStaff(_id, username, updateData, systemId) {
    try {
      const db = getClient();

      // Check for duplicates if updating username, email, or phone
      if (updateData.username || updateData.email || updateData.phone) {
        const existingLab = await db.collection("labs").findOne({
          _id: new ObjectId(_id),
          "staffs.username": { $ne: username }, // Exclude current staff
          $or: [
            { "staffs.username": updateData.username },
            { "staffs.email": updateData.email },
            { "staffs.phone": updateData.phone },
          ],
        });

        if (existingLab) {
          const existingStaff = existingLab.staffs.find(
            (staff) =>
              staff.username === updateData.username ||
              staff.email === updateData.email ||
              staff.phone === updateData.phone
          );

          const duplicateFields = [];
          if (existingStaff.username === updateData.username) duplicateFields.push("username");
          if (existingStaff.email === updateData.email) duplicateFields.push("email");
          if (existingStaff.phone === updateData.phone) duplicateFields.push("phone");

          throw new Error(`Duplicate values found: ${duplicateFields.join(", ")} already exists in this lab`);
        }
      }

      const updateFields = {};
      if (updateData.username) updateFields["staffs.$.username"] = updateData.username;
      if (updateData.email) updateFields["staffs.$.email"] = updateData.email;
      if (updateData.phone) updateFields["staffs.$.phone"] = updateData.phone;
      if (updateData.password) updateFields["staffs.$.password"] = updateData.password;
      if (updateData.fullName) updateFields["staffs.$.fullName"] = updateData.fullName;
      if (updateData.designation) updateFields["staffs.$.designation"] = updateData.designation;

      updateFields["staffs.$.updatedAt"] = new Date();
      updateFields["staffs.$.updatedBy"] = systemId;

      const result = await db.collection("labs").findOneAndUpdate(
        {
          _id: new ObjectId(_id),
          "staffs.username": username,
        },
        {
          $set: updateFields,
        },
        { returnDocument: "after" }
      );

      if (!result.value) {
        throw new Error("Staff not found");
      }

      return result.value;
    } catch (e) {
      return handleError(e, "updateStaff");
    }
  }
}

module.exports = LabStaff;
