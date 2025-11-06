/** @format */

const Test = require("../database/labTest");

// Function 1: Create a Test Category
const createCategory = async (req, res, next) => {
  try {
    //console.log('postTestCategory called');
    const systemId = 555;
    const { categoryName } = req.body;
    const result = await Test.createCategory(categoryName, systemId);
    if (result?.success) {
      return res.status(201).send({ _id: result.categoryId, categoryName: req.body.categoryName, tests: [] });
    } else if (result.duplicate) {
      return res.status(400).send({ duplicate: true });
    } else {
      return res.status(400).send({ success: false, msg: "Failed to create category" });
    }
  } catch (e) {
    next(e);
  }
};

// Function 2: Get a category (with testlist)
const listTestsByCategory = async (req, res, next) => {
  try {
    const _id = req.body.categoryId;
    const result = await Test.findTestsByCategoryId(_id);
    if (result?.success) {
      return res.status(200).send(result.category);
    } else {
      return res.status(200).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

// Function 3: Get all categories (with tests)
const listTests = async (req, res, next) => {
  try {
    const result = await Test.findAllCategories();
    if (result.success) {
      return res.status(200).send(result.categories);
    } else {
      return res.status(200).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

// Function 4: Update a category name
const updateCategory = async (req, res, next) => {
  try {
    const systemId = 555;
    const { categoryId, categoryName } = req.body;
    const result = await Test.updateCategory(categoryId, categoryName, systemId);
    if (result.success) {
      return res.status(200).send({ success: true, msg: "Category Updated" });
    } else if (result.duplicate) {
      return res.status(400).send({ duplicate: true });
    } else {
      return res.status(400).send({ success: false, msg: "Category Not Updated" });
    }
  } catch (e) {
    next(e);
  }
};

// Function 5: Delete a zone (with its subzones)
const deleteCategory = async (req, res, next) => {
  try {
    const systemId = 555;
    const _id = req.body.categoryId;
    const result = await Test.deleteCategory(_id, systemId);
    if (result.success) {
      return res.status(200).send({ success: true, msg: "Category deleted" });
    } else {
      return res.status(400).send({ success: false, msg: "Category not found" });
    }
  } catch (e) {
    next(e);
  }
};

// Function 6: Create a test
const createTest = async (req, res, next) => {
  try {
    const systemId = 555;
    const { categoryId, testName, isOnline } = req.body;
    const result = await Test.createTest(categoryId, testName, isOnline, systemId);
    if (result.success) {
      return res.status(201).send(result.test);
    } else if (result.duplicate) {
      return res.status(400).send({ duplicate: true });
    } else {
      return res.status(400).send({ success: false, msg: "Test was not created" });
    }
  } catch (e) {
    next(e);
  }
};

// Function 7: Update a test
const updateTest = async (req, res, next) => {
  try {
    const systemId = 555;
    const { categoryId, testId, testName, isOnline } = req.body;
    const result = await Test.updateTest(categoryId, testId, testName, isOnline, systemId);
    if (result.success) {
      return res.status(200).send(result.test);
    } else if (result.duplicate) {
      return res.status(400).send({ duplicate: true });
    } else {
      return res.status(400).send({ success: false, msg: "Test not found" });
    }
  } catch (e) {
    next(e);
  }
};

// Function 8: Delete a test
const deleteTest = async (req, res, next) => {
  try {
    const systemId = 555;
    const { categoryId, testId } = req.body;
    const result = await Test.deleteTest(categoryId, testId, systemId);
    if (result.success) {
      return res.status(200).send({ success: true, msg: "Test deleted" });
    } else {
      return res.status(400).send({
        success: false,
        msg: "Test not found or was not deleted",
      });
    }
  } catch (e) {
    next(e);
  }
};

module.exports = {
  // Category endpoints
  createCategory,
  listTestsByCategory,
  listTests,
  updateCategory,
  deleteCategory,

  // Test endpoints
  createTest,
  updateTest,
  deleteTest,
};
