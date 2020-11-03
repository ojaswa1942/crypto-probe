const chalk = require('chalk');

const defineSchemes = {
  DEFAULT: chalk.reset.hex('#00FFFF'),
  BOLD: chalk.bold.hex('#00FFFF'),
  ERROR: chalk.bold.red,
  WARNING: chalk.keyword(`orange`),
};

const logger = (...args) => {
  let { type } = args[0];
  const dateTime = new Date().toLocaleString();
  if (type) {
    // eslint-disable-next-line no-console
    console.log(`[LOG] ${dateTime}:`, defineSchemes[type.toUpperCase()](...args.splice(1)));
  } else {
    type = `DEFAULT`;
    // eslint-disable-next-line no-console
    console.log(`[LOG] ${dateTime}:`, defineSchemes[type](...args));
  }
};

module.exports = logger;
