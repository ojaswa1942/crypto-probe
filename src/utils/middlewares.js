const withPrivilege = (req, res, next) => {
  const { isAuthenticated, isPrivileged } = req.context;
  if (!isAuthenticated || !isPrivileged) {
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
