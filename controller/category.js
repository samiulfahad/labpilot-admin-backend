const Category = require("../database/category");

const postCategory = async (req, res, next) => {
  try {
    const systemId = 555;
    const { categoryName } = req.body;
    const category = new Category(categoryName, systemId);
    const result = await category.save();
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

const getAllCategories = async (req, res, next) => {
  try {
    const result = await Category.findAll();
    if (result?.success) {
      res.status(201).send(result.categories);
    } else {
      res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

const patchCategory = async (req, res, next) => {
  try {
    const systemId = 555;
    const { _id, categoryName } = req.body;
    const result = await Category.update(_id, categoryName, systemId);
    if (result?.success) {
      res.status(201).send(result.category);
    } else if (result?.duplicate) {
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
    const result = await Category.delete(_id);
    if (result?.success) {
      res.status(201).send({ success: true });
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
  getAllCategories,
};
