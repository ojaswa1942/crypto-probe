const fetch = require('node-fetch');

class ScanService {
  static analyze = async (args, context) => {
    const { address } = args;
    const { db, logger, userEmail } = context;

    logger(`[ANALYZE]`, userEmail, address);

    try {
      const existingData = await db.collection(`contracts`)
      .findOne({ _id: address });
      if(existingData) {
        return {
          success: true,
          body: {
            address,
            isHoneypot: existingData.isHoneypot || false,
            category: existingData.category || null,
          },
        };
      }

      const scanResponse = await fetch(`http://detectionsystem:5000/scan/${address}`)
      .then(res => res.json())
      .then(res => res);

      await db.collection(`contracts`).insertOne({
        _id: address,
        isHoneypot: scanResponse.isHoneypot || false,
        category: scanResponse.category || null,
        report: scanResponse.reports,
      });

      return {
        success: true,
        body: {
          address,
          isHoneypot: scanResponse.isHoneypot || false,
          category: scanResponse.category || null,
        },
      };
    }
    catch(error) {
      logger({ type: `error`}, `[ANALYZE]`, `Some error occurred`, error);
      return ({
        success: false,
        error: "Something went wrong",
      });
    }
  };

  static details = async (args, context) => {
    const { address } = args;
    const { db, logger, userEmail } = context;

    logger(`[DETAILS]`, userEmail, address);

    try {
      const existingData = await db.collection(`contracts`)
      .findOne({ _id: address });
      if(existingData) {
        return {
          success: true,
          body: {
            address,
            report: existingData.report
          },
        };
      }

      return {
        success: false,
        error: `Unknown contract address. Kindly initiate a scan first.`
      };
    }
    catch(error) {
      logger({ type: `error`}, `[DETAILS]`, `Some error occurred`, error);
      return ({
        success: false,
        error: "Something went wrong",
      });
    }
  };
}

module.exports = ScanService;
