const LabAdmin = require("../database/labAdmin");

postAdmin = async (req, res, next) => {
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

module.exports = { postAdmin };
