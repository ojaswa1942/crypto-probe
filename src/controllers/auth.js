const AuthService = require('../services/AuthService');
const { stripScriptTags } = require('../utils/helpers');

const auth = async (req, res) => {
  try {
    let { username, password } = req.body;
    [username] = stripScriptTags(username);
    if (!username || !password) {
      return res.status(400).json('Email and password are required');
    }

    const serviceRes = await AuthService.login({ username, password }, req.context);
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
