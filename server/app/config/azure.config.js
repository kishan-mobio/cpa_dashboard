import passport from 'passport';
import { BlobServiceClient } from '@azure/storage-blob';
import logger from './logger.config.js';
import { CONSTANTS } from '../utils/constants.utils.js';

/* Azure Blob Storage Configuration */
let blobServiceClient, containerClient;

try {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

  if (!connectionString || !containerName) {
    throw new Error(CONSTANTS.AZURE.MISSING_STORAGE_CONFIG);
  }

  blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  containerClient = blobServiceClient.getContainerClient(containerName);

  logger.info(CONSTANTS.AZURE.STORAGE_INITIALIZED);
} catch (error) {
  logger.warn(CONSTANTS.AZURE.STORAGE_SETUP_SKIPPED, error.message);
}

// Define azureBlob as a constant object for export
const azureBlob = {
  blobServiceClient,
  containerClient,
};

// Exporting Azure Passport and Blob Configuration
export const azurePassport = passport;
export { azureBlob };
