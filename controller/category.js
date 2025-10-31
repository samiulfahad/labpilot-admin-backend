const TestCategory = require("../database/category");

const postCategory = async (req, res, next) => {
  try {
    const { categoryName } = req.body;
    const result = await TestCategory.create(categoryName);
    if (result.success) {
      res.status(201).send(result.category);
    } else if (result.duplicate) {
      res.status(400).send({ duplicate: true });
    } else {
      res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

const patchCategory = async (req, res, next) => {
  try {
    const { _id, categoryName } = req.body;
    const result = await TestCategory.update({ _id, categoryName });
    if (result.success) {
      res.status(201).send(result.category);
    } else if (result.duplicate) {
      res.status(400).send({ duplicate: true });
    } else {
      res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { _id } = req.body;
    const result = await TestCategory.delete(_id);
    if (result.success) {
      res.status(201).send(result.category);
    } else {
      res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const result = await TestCategory.getAll();
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
  postCategory,
  patchCategory,
  deleteCategory,
  getCategories,
};
