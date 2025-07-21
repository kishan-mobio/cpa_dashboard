import { CONSTANTS } from './constants.utils.js';

export const DB_OPERATIONS = {
  CREATE: 'create',
  INSERT_MANY: 'insertMany',
  FIND_ONE: 'findOne',
  FIND: 'find',
  FIND_BY_ID: 'findById',
  FIND_ONE_AND_UPDATE: 'findOneAndUpdate',
  FIND_BY_ID_AND_UPDATE: 'findByIdAndUpdate',
  UPDATE_ONE: 'updateOne',
  UPDATE_MANY: 'updateMany',
  FIND_ONE_AND_DELETE: 'findOneAndDelete',
  FIND_BY_ID_AND_DELETE: 'findByIdAndDelete',
  DELETE_ONE: 'deleteOne',
  DELETE_MANY: 'deleteMany',
  AGGREGATE: 'aggregate',
  COUNT_DOCUMENTS: 'countDocuments',
  ESTIMATED_DOCUMENT_COUNT: 'estimatedDocumentCount',
};

/**
 * Perform a dynamic database operation
 * @param {Object} model - Mongoose model
 * @param {string} operation - Operation type (e.g., 'findOne', 'create', 'updateOne', 'deleteOne')
 * @param {Object|Array} filter - MongoDB filter object or data (e.g., for create/insertMany)
 * @param {Object} [updateData] - Data to update (for update operations)
 * @param {Object} [options] - Additional options for the operation
 * @returns {Promise<Object|Array|null>} Result of the database operation
 */
export const performDbOperation = async (
  model,
  operation,
  filter,
  updateData = {},
  options = {}
) => {
  try {
    switch (operation) {
      case DB_OPERATIONS.CREATE:
        return model.create(filter);

      case DB_OPERATIONS.INSERT_MANY:
        return model.insertMany(filter, options);

      case DB_OPERATIONS.FIND_ONE:
        return model.findOne(filter, options);

      case DB_OPERATIONS.FIND:
        return model.find(filter, options);

      case DB_OPERATIONS.FIND_BY_ID:
        return model.findById(filter, options);

      case DB_OPERATIONS.FIND_ONE_AND_UPDATE:
        return model.findOneAndUpdate(filter, updateData, {
          new: true,
          ...options,
        });

      case DB_OPERATIONS.FIND_BY_ID_AND_UPDATE:
        return model.findByIdAndUpdate(filter, updateData, {
          new: true,
          ...options,
        });

      case DB_OPERATIONS.UPDATE_ONE:
        return model.updateOne(filter, updateData, options);

      case DB_OPERATIONS.UPDATE_MANY:
        return model.updateMany(filter, updateData, options);

      case DB_OPERATIONS.FIND_ONE_AND_DELETE:
        return model.findOneAndDelete(filter, options);

      case DB_OPERATIONS.FIND_BY_ID_AND_DELETE:
        return model.findByIdAndDelete(filter, options);

      case DB_OPERATIONS.DELETE_ONE:
        return model.deleteOne(filter, options);

      case DB_OPERATIONS.DELETE_MANY:
        return model.deleteMany(filter, options);

      case DB_OPERATIONS.AGGREGATE:
        return model.aggregate(filter, options);

      case DB_OPERATIONS.COUNT_DOCUMENTS:
        return model.countDocuments(filter);

      case DB_OPERATIONS.ESTIMATED_DOCUMENT_COUNT:
        return model.estimatedDocumentCount();

      default:
        throw new Error(
          `${CONSTANTS.DB_OPERATIONS_MESSAGES.QUERY_ERROR} ${operation}`
        );
    }
  } catch (error) {
    throw new Error(
      `${CONSTANTS.DB_OPERATIONS_MESSAGES.DB_ERROR} ${error.message}`
    );
  }
};
