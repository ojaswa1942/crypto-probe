const xss = require('xss');
const logger = require('./logger');

const stripScriptTags = (...args) => {
  const xssOptions = {
    whiteList: [],
    stripIgnoreTag: [],
    stripIgnoreTagBody: ['script'],
  };

  const answerArray = args.map((val) => (val ? xss(val, xssOptions) : val));
  return answerArray;
};

module.exports = {
  stripScriptTags,
};
