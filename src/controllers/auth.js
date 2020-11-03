const AuthService = require('../services/AuthService');
const { stripScriptTags } = require('../utils/helpers');

const auth = async (req, res) => {
  try {
    let { email, password } = req.body;
    [email] = stripScriptTags(email);
    if (!email || !password) {
      return res.status(400).json('Email and password are required');
    }

    const serviceRes = await AuthService.login({ email, password }, req.context);
    if (serviceRes.success) {
      return res.status(200).json(serviceRes.body);
    }
    return res.status(400).json(`${serviceRes.error}`);
  } catch (error) {
    req.context.logger({ type: `error` }, `Error while handling user/login controller:`, error);
    return res.status(500).json('Something went wrong!');
  }
};

module.exports = auth;
