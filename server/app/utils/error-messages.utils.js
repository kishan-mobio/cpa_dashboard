export const ERROR_MESSAGES = {
  QUEUE: {
    REDIS_CONNECTION:
      'Redis server is not running. Please start Redis server to use queue features.',
    REDIS_SETUP:
      'To use queue features, please:\n1. Install Redis\n2. Start Redis server\n3. Verify Redis connection',
    JOB_FAILED: 'Failed to process job: {jobId}',
    JOB_CREATION: 'Failed to create job: {jobType}',
  },
  STORAGE: {
    AWS: {
      CONNECTION:
        'AWS S3 connection failed. Please check your AWS credentials and region.',
      INVALID_REGION:
        'Invalid AWS region specified. Please check your AWS_REGION configuration.',
    },
    AZURE: {
      CONNECTION:
        'Azure Storage connection failed. Please check your Azure credentials.',
      INVALID_URL:
        'Invalid Azure Storage URL. Please check your connection string.',
    },
    CLOUDINARY: {
      CONNECTION:
        'Cloudinary connection failed. Please check your Cloudinary credentials.',
    },
  },
};

export const formatErrorMessage = (message, params = {}) => {
  return Object.entries(params).reduce(
    (msg, [key, value]) => msg.replace(`{${key}}`, value),
    message
  );
};
