const logger = require('./logger');

const withPrivilege = (req, res, next) => {
  const { isAuthenticated, isPrivileged, userEmail } = req.context;
  if (!isAuthenticated || !isPrivileged) {
    logger({ type: `warning` }, `Unauthorized priviledge operation attempted`, `${userEmail? userEmail : ``}`);
    return res.status(401).json('Not authorized');
  }
  return next();
};

const withAuth = async (req, res, next) => {
  if (!req.context.isAuthenticated) {
    return res.status(401).json('Not authorized');
  }
  return next();
};

module.exports = {
  withAuth,
  withPrivilege,
};
