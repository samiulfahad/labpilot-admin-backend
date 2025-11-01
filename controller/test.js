const Test = require("../database/test");

// Function 1: Create a test
const postTest = async (req, res, next) => {
  try {
    const systemId = 555;
    const { testName, categoryId, isOnline } = req.body;
    const test = new Test(testName, categoryId, isOnline, systemId);
    const result = await test.save();
    if (result?.success) {
      res.status(201).send(result.test);
    } else if (result?.duplicate) {
      res.status(400).send({ duplicate: true });
    } else {
      res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

// Function 2: Get All Tests
const getAllTests = async (req, res, next) => {
  try {
    let categoryId = null;
    if (req.body?.categoryId) categoryId = req.body.categoryId;
    const result = await Test.findAll(categoryId);
    if (result?.success) {
      res.status(201).send(result.tests);
    } else {
      res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

// Function 3: Update test
const patchTest = async (req, res, next) => {
  try {
    const systemId = 555;
    const { _id, testName, categoryId, isOnline } = req.body;
    const result = await Test.update(_id, testName, categoryId, isOnline, systemId);
    if (result.success) {
      res.status(201).send(result.test);
    } else if (result.duplicate) {
      res.status(400).send({ duplicate: true });
    } else {
      res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

// Function 4: Delete test
const deleteTest = async (req, res, next) => {
  try {
    const { _id } = req.body;
    const result = await Test.delete(_id);
    if (result?.success) {
      res.status(201).send({ success: true, message: "Test Deleted" });
    } else {
      res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

module.exports = {
  postTest,
  getAllTests,
  patchTest,
  deleteTest,
};
