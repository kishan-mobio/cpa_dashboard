import csv from 'csv-parser';
import { format } from 'fast-csv';
import ExcelJS from 'exceljs';
import fs from 'fs';
import { CONSTANTS } from './constants.utils.js';
import { isCSVFile, isExcelFile } from './excel_methods.utils.js';
import { typeValidators } from '../validators/excel.validator.js';
import { EXCEL, SYSTEM } from './global.constants.js';
import multer from 'multer';
import path from 'path';

const upload = multer({
  dest: path.join(import.meta.dirname, '../dummy-data/uploads/'),
});

export const uploadSingleFile = upload.single('file');

const checkMissingHeaders = (headers, schema) =>
  Object.keys(schema).filter((header) => !headers.includes(header));

const trackDuplicates = (data, uniqueFields) => {
  const trackers = {};
  data.forEach((row, index) => {
    uniqueFields.forEach((field) => {
      const value = row[field]?.toString().trim();
      if (value) {
        trackers[field] ??= {};
        if (!trackers[field][value]) {
          trackers[field][value] = [];
        }
        trackers[field][value].push(index + 1);
      }
    });
  });
  return trackers;
};

const formatDuplicateErrors = (trackers) =>
  Object.entries(trackers).flatMap(([field, values]) =>
    Object.entries(values)
      .filter(([_, rows]) => rows.length > 1)
      .map(([value, rows]) => {
        const formattedRows =
          rows.length === 2
            ? rows.join(EXCEL.OPERATORS.AND)
            : `${rows.slice(0, -1).join(', ')}${EXCEL.OPERATORS.AND}${rows.slice(-1)}`;
        return CONSTANTS.EXCEL.VALIDATION_MESSAGES.DUPLICATE_VALUE(
          value,
          field,
          formattedRows
        );
      })
  );

export const validateData = async (data, schema, uniqueFields = []) => {
  if (!data.length) {
    throw new Error(CONSTANTS.EXCEL.NO_DATA_FOUND);
  }

  const headers = Object.keys(data[0]);
  const missingHeaders = checkMissingHeaders(headers, schema);

  if (missingHeaders.length) {
    throw new Error(
      `${CONSTANTS.EXCEL.MISSING_HEADERS}: ${missingHeaders.join(', ')}`
    );
  }

  const errors = data.flatMap((row, index) =>
    Object.entries(schema)
      .map(([key, expectedType]) => {
        const value = row[key]?.toString().trim();
        if (!value) {
          return CONSTANTS.EXCEL.VALIDATION_MESSAGES.MISSING_VALUE(
            index + 1,
            key
          );
        }
        if (
          (typeof expectedType === SYSTEM.FUNCTION_TYPES.FUNCTION &&
            !expectedType(value)) ||
          (typeValidators[expectedType] && !typeValidators[expectedType](value))
        ) {
          const errorLabel =
            typeof expectedType === SYSTEM.FUNCTION_TYPES.FUNCTION
              ? 'value'
              : expectedType;
          return CONSTANTS.EXCEL.VALIDATION_MESSAGES.INVALID_VALUE(
            index + 1,
            key,
            value,
            errorLabel
          );
        }
        return null;
      })
      .filter(Boolean)
  );

  errors.push(...formatDuplicateErrors(trackDuplicates(data, uniqueFields)));

  if (errors.length) {
    throw new Error(errors.join('\n'));
  }
  return CONSTANTS.EXCEL.VALIDATION_SUCCESS;
};

export const parseXLS = async (filePath) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);

    const headers = worksheet.getRow(1).values.slice(1);
    const jsonData = worksheet.getRows(2, worksheet.rowCount).map((row) =>
      headers.reduce((obj, header, i) => {
        obj[header] = row.getCell(i + 1).value;
        return obj;
      }, {})
    );

    return jsonData;
  } catch (error) {
    throw new Error(error.message);
  } finally {
    fs.existsSync(filePath) && fs.unlinkSync(filePath);
  }
};

export const parseData = async ({ originalname, path }) => {
  if (isCSVFile(originalname)) return parseCSV(path);
  if (isExcelFile(originalname)) return parseXLS(path);
  throw new Error(CONSTANTS.EXCEL.INVALID_FILE_TYPE);
};

export const convertData = async (data, type) => {
  switch (type) {
    case EXCEL.TYPES.CSV:
      return convertToCSV(data);
    case EXCEL.TYPES.XLSX:
    case EXCEL.TYPES.XLS:
      return convertToXLSX(data);
    default:
      throw new Error(CONSTANTS.EXCEL.INVALID_FILE_TYPE);
  }
};

export const parseCSV = (filePath) =>
  new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on(EXCEL.EVENTS.DATA, (data) => results.push(data))
      .on(EXCEL.EVENTS.END, () => {
        fs.unlink(filePath, (err) => err && console.error(err));
        resolve(results);
      })
      .on(EXCEL.EVENTS.ERROR, (error) => reject(new Error(error)));
  });

export const convertToCSV = (data, headers = []) =>
  new Promise((resolve, reject) => {
    try {
      const csvChunks = [];
      const stream = format({ headers: headers.length ? headers : true });

      stream
        .on(EXCEL.EVENTS.DATA, (chunk) => csvChunks.push(chunk.toString()))
        .on(EXCEL.EVENTS.END, () => resolve(csvChunks.join('')))
        .on(EXCEL.EVENTS.ERROR, reject);

      data.forEach((row) => stream.write(row));
      stream.end();
    } catch (error) {
      console.error(CONSTANTS.EXCEL.CSV_CONVERSION_ERROR);
      throw new Error(error.message);
    }
  });

export const convertToXLSX = async (data) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(CONSTANTS.EXCEL.SHEET_NAME);

    if (data.length) {
      worksheet.columns = Object.keys(data[0]).map((header) => ({
        header,
        key: header,
      }));
      worksheet.addRows(data);
    }

    return workbook.xlsx.writeBuffer();
  } catch (error) {
    throw new Error(
      `${CONSTANTS.EXCEL.XLSX_CONVERSION_ERROR}: ${error.message}`
    );
  }
};
