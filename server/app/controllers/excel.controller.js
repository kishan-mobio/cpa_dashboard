import { convertData, parseData } from '../utils/excel.utils.js';
import { CONSTANTS } from '../utils/constants.utils.js';
import * as status from '../utils/status_code.utils.js';
import { getExcelData, uploadExcelData } from '../services/excel.service.js';
import { errorResponse, successResponse } from '../utils/response.util.js';

/**
 * @api /api/v1/excel/import-data
 * @method POST
 * @description Import data from a CSV or XLSX file and save it to the database.
 * @author kishankalavadia
 */
export const importData = async (req, res) => {
  try {
    await uploadExcelData(req.file.originalname, await parseData(req.file));

    return res
      .status(status.STATUS_CODE_SUCCESS)
      .json(successResponse(CONSTANTS.EXCEL.FILE_UPLOADED_SUCCESSFULLY));
  } catch (error) {
    return res
      .status(status.STATUS_CODE_BAD_REQUEST)
      .json(errorResponse(CONSTANTS.USER.INTERNAL_SERVER_ERROR, error.message));
  }
};

/**
 * @api /api/v1/excel/export-data
 * @method POST
 * @description Export data from the database to a CSV or XLSX file.
 * @author kishankalavadia
 */
export const exportData = async (req, res) => {
  try {
    const { name, type } = req.body;

    return res
      .status(status.STATUS_CODE_SUCCESS)
      .json(
        successResponse(
          CONSTANTS.EXCEL.EXCEL_EXPORTED_SUCCESSFULLY,
          await convertData((await getExcelData(name)).data, type)
        )
      );
  } catch (error) {
    return res
      .status(status.STATUS_CODE_INTERNAL_SERVER_STATUS)
      .json(errorResponse(CONSTANTS.EXCEL.ERROR_EXPORTING_CSV, error.message));
  }
};
