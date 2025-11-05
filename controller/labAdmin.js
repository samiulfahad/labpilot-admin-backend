const LabAdmin = require("../database/labAdmin");

const postAdmin = async (req, res, next) => {
  try {
    const adminData = ({ _id, username, password, email, phone } = req.body);
    // console.log(adminData);
    const systemId = 555;
    const result = await LabAdmin.add(_id, adminData, systemId);
    if (result.success) {
      return res.status(201).send(result.admin);
    } else if (result.duplicate) {
      return res.status(400).send({ duplicate: true, message: result.message });
    } else {
      return res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

const deactivateAdmin = async (req, res, next) => {
  try {
    const { _id, adminId } = req.body;
    // console.log(adminData);
    const systemId = 555;
    const result = await LabAdmin.deactivate(_id, adminId, systemId);
    if (result.success) {
      return res.status(201).send({ success: true, adminId: result.adminId });
    } else {
      return res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

const activateAdmin = async (req, res, next) => {
  try {
    const { _id, adminId } = req.body;
    // console.log(adminData);
    const systemId = 555;
    const result = await LabAdmin.activate(_id, adminId, systemId);
    if (result.success) {
      return res.status(201).send({ success: true, adminId: result.adminId });
    } else {
      return res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

const getAllAdmins = async (req, res, next) => {
  try {
    const { _id } = req.body;
    // console.log(adminData);
    const systemId = 555;
    const result = await LabAdmin.getAll(_id);
    if (result.success) {
      return res.status(201).send(result.admins);
    } else {
      return res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

const deleteAdmin = async (req, res, next) => {
  try {
    const { _id, adminId } = req.body;
    // console.log(adminData);
    const systemId = 555;
    const result = await LabAdmin.delete(_id, adminId, systemId);
    if (result.success) {
      return res.status(201).send({ success: true, adminId: result.adminId });
    } else {
      return res.status(400).send({ success: false });
    }
  } catch (e) {
    next(e);
  }
};

module.exports = { postAdmin, deactivateAdmin, activateAdmin, getAllAdmins, deleteAdmin };
