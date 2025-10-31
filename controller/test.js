const Test = require("../database/test");

const postTest = async (req, res, next) => {
  try {
    const { testName } = req.body;
    const result = await Test.create(testName);
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

const patchTest = async (req, res, next) => {
  try {
    const { _id, categoryId, testName } = req.body;
    const result = await Test.update({ _id, categoryId, testName });
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

const deleteTest = async (req, res, next) => {
  try {
    const { _id } = req.body;
    const result = await Test.delete(_id);
    if (result.success) {
      res.status(201).send(result.category);
    } else {
      res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

const getTests = async (req, res, next) => {
  try {
    const result = await Test.getAll();
    if (result.success) {
      res.status(201).send(result.categories);
    } else {
      res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

module.exports = {
  postTest,
  patchTest,
  deleteTest,
  getTests,
};
