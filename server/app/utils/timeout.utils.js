import { errorResponse } from './response.util.js';
import { CONSTANTS } from '../utils/constants.utils.js';

const defaultTimeout = process.env.TIMEOUT;

const withTimeout =
  (handler, timeout = defaultTimeout) =>
  async (req, res, next) => {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(CONSTANTS.ERRORS.TIMEOUT_ERROR)),
        timeout
      )
    );

    try {
      const response = await Promise.race([
        handler(req, res, next),
        timeoutPromise,
      ]);

      return response;
    } catch (error) {
      // Handle specific timeout error
      if (error.message === CONSTANTS.ERRORS.TIMEOUT_ERROR) {
        if (!res.headersSent) {
          return errorResponse(CONSTANTS.ERRORS.TIMEOUT);
        }
      }
      // Handle other errors
      if (!res.headersSent) {
        return errorResponse(CONSTANTS.ERRORS.GENERAL);
      }
    }
  };

export default withTimeout;
