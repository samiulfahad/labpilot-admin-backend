/** @format */

const { ObjectId } = require("mongodb");
const { getClient } = require("./connection");

const handleError = (e, methodName) => {
  console.log("Error Location: DB File (database > category.js)");
  console.log(`Method Name: ${methodName}`);
  console.log(`Error Message: ${e.message}`);
  return null;
};

const projection = {
  categoryName: 1,
};

class Category {
  constructor(categoryName, systemId) {
    this.categoryName = categoryName;
    this.createdBy = systemId;
    this.createdAt = new Date();
  }

  // Function 1: Create a new test category
  async save() {
    try {
      const db = getClient();

      // Check if categoryName already exists
      const existing = await db.collection("testCategories").findOne({ categoryName: this.categoryName });

      if (existing) {
        return {
          success: false,
          duplicate: true,
          message: "Category name already exists",
        };
      }

      const result = await db.collection("testCategories").insertOne(this);

      if (result.insertedId) {
        // Fetch the inserted category with projection
        const insertedCategory = await db
          .collection("testCategories")
          .findOne({ _id: result.insertedId }, { projection });

        return {
          success: true,
          insertedId: result.insertedId,
          category: insertedCategory,
        };
      } else {
        return {
          success: false,
          message: "Failed to create category",
        };
      }
    } catch (e) {
      return handleError(e, "save");
    }
  }

  // Function 2: Get all categories
  static async findAll() {
    try {
      const db = getClient();
      const categories = await db
        .collection("testCategories")
        .find({})
        .project(projection)
        .sort({ categoryName: 1 }) // Sort alphabetically
        .toArray();

      return { success: true, categories: categories }; // ✅ Always return array
    } catch (e) {
      return handleError(e, "findAll");
    }
  }

  // Function 3: Update a category
  static async update(_id, newCategoryName, systemId) {
    try {
      const db = getClient();

      // Check if new category name already exists (excluding current category)
      const existing = await db.collection("testCategories").findOne({
        categoryName: newCategoryName,
        _id: { $ne: new ObjectId(_id) },
      });
      // console.log(existing);
      if (existing) {
        return {
          success: false,
          duplicate: true,
          message: "Category name already exists",
        };
      }

      const updateFields = {
        categoryName: newCategoryName,
        updatedBy: systemId,
        updatedAt: new Date(),
      };

      const result = await db
        .collection("testCategories")
        .updateOne({ _id: new ObjectId(_id) }, { $set: updateFields });

      if (result.modifiedCount > 0) {
        // Fetch updated category
        const updatedCategory = await db
          .collection("testCategories")
          .findOne({ _id: new ObjectId(_id) }, { projection });

        return {
          success: true,
          category: updatedCategory,
          message: "Category updated successfully",
        };
      } else {
        return {
          success: false,
          message: "No changes made or category not found",
        };
      }
    } catch (e) {
      return handleError(e, "update");
    }
  }

  // Function 4: Delete category - completely remove from database
  static async delete(_id) {
    try {
      const db = getClient();

      const result = await db.collection("testCategories").deleteOne({ _id: new ObjectId(_id) });

      if (result.deletedCount > 0) {
        return {
          success: true,
          message: "Category deleted successfully",
        };
      } else {
        return {
          success: false,
          message: "Category not found",
        };
      }
    } catch (e) {
      return handleError(e, "delete");
    }
  }
}

module.exports = Category;
