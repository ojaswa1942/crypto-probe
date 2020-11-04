const ScanService = require('../services/ScanService');
const { stripScriptTags } = require('../utils/helpers');

const analyze = async (req, res) => {
  try {
    let { address } = req.body;
    [address] = stripScriptTags(address);
    if (!address) {
      return res.status(400).json('Contract address is required');
    }

    const serviceRes = await ScanService.analyze({ address }, req.context);
    if (serviceRes.success) {
      return res.status(200).json(serviceRes.body);
    }
    return res.status(400).json(`${serviceRes.error}`);
  } catch (error) {
    req.context.logger({ type: `error` }, `Error while handling analyze controller:`, error);
    return res.status(500).json('Something went wrong!');
  }
};

module.exports = analyze;
