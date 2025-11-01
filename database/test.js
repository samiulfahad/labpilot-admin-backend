/** @format */

const { ObjectId } = require("mongodb");
const { getClient } = require("./connection");

const handleError = (e, methodName) => {
  console.log("Error Location: DB File (database > test.js)");
  console.log(`Method Name: ${methodName}`);
  console.log(`Error Message: ${e.message}`);
  return null;
};
const projection = {
  testName: 1,
  categoryId: 1,
};

class Test {
  constructor(testName, categoryId, isOnline, systemId) {
    this.testName = testName;
    this.categoryId = new ObjectId(categoryId);
    this.isOnline = isOnline;
    this.createdBy = systemId;
    this.createdAt = new Date();
  }

  // CREATE: Create a new test
  async save() {
    try {
      const db = getClient();

      const existing = await db.collection("tests").findOne({
        testName: this.testName,
      });

      if (existing) {
        return { success: false, duplicate: true };
      }
      const validCat = await db.collection("testCategories").findOne({
        _id: new ObjectId(this.categoryId),
      });

      if (!validCat) {
        // console.log("No Category was found angaist categoryId");
        return { success: false };
      }
      const result = await db.collection("tests").insertOne(this);

      if (result.insertedId) {
        const insertedTest = await db.collection("tests").findOne({ _id: result.insertedId }, { projection });

        return {
          success: true,
          insertedId: result.insertedId,
          test: insertedTest,
        };
      } else {
        return { success: false };
      }
    } catch (e) {
      return handleError(e, "save");
    }
  }

  // READ: Get all tests
  static async findAll(categoryId = null) {
    try {
      const db = getClient();

      const filter = {};
      if (categoryId) {
        filter.categoryId = new ObjectId(categoryId);
      }

      const tests = await db.collection("tests").find(filter).project(projection).sort({ testName: 1 }).toArray();
      // console.log(tests);
      return { success: true, tests };
    } catch (e) {
      return handleError(e, "findAll");
    }
  }

  // UPDATE: Update a test
  static async update(_id, newTestName, categoryId, isOnline, systemId) {
    try {
      const db = getClient();

      const objectId = new ObjectId(_id);
      const categoryObjectId = new ObjectId(categoryId);

      const existing = await db.collection("tests").findOne({
        testName: newTestName,
        _id: { $ne: objectId },
      });

      if (existing) {
        return { success: false, duplicate: true };
      }

      const validCat = await db.collection("testCategories").findOne({
        _id: categoryObjectId,
      });

      if (!validCat) {
        console.log("No Category was found angaist categoryId");
        return { success: false };
      }

      const updateFields = {
        testName: newTestName,
        categoryId: categoryObjectId,
        isOnline: isOnline,
        updatedBy: systemId,
        updatedAt: new Date(),
      };

      const result = await db.collection("tests").updateOne({ _id: objectId }, { $set: updateFields });
      // console.log(result);
      if (result.modifiedCount > 0) {
        const updatedTest = await db.collection("tests").findOne({ _id: objectId }, { projection });

        return {
          success: true,
          test: updatedTest,
        };
      } else {
        return { success: false };
      }
    } catch (e) {
      return handleError(e, "update");
    }
  }

  // DELETE: Delete a test
  static async delete(_id) {
    try {
      const db = getClient();
      const objectId = new ObjectId(_id);

      const result = await db.collection("tests").deleteOne({ _id: objectId });

      if (result.deletedCount > 0) {
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (e) {
      return handleError(e, "delete");
    }
  }
}

module.exports = Test;
