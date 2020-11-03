require('dotenv').config();

const {
  PORT,
  DBHOST,
  DBUSER,
  DBNAME,
  DBPASSWORD,
  JWT_SECRET,
} = process.env;

module.exports = {
	port: PORT || 3000,
	db: {
		uri: `mongodb+srv://${DBUSER}:${DBPASSWORD}@${DBHOST}/${DBNAME}?retryWrites=true&w=majority`,
    database: DBNAME,
	},
	secrets: {
		jwt: JWT_SECRET,
	}
};