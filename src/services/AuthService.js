const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { secrets } = require('../utils/config');

class AuthService {
  static login = async (args, context) => {
    const { email, password } = args;
    const { db, logger } = context;

    const authUsers = await db.select().from(`auth`).where({ email });
    if (!authUsers.length) return { success: false, error: `Incorrect Credentials` };

    const user = authUsers[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return { success: false, error: `Incorrect Credentials` };

    const payload = {
      userEmail: user.email,
      accountType: user.type,
    };
    const token = jwt.sign(payload, secrets.jwt, {
      expiresIn: '10d',
    });

    logger(`[LOGIN]`, payload.userEmail, payload.accountType);

    return { success: true, body: { message: 'Logged in', token } };
  };
}

module.exports = AuthService;
