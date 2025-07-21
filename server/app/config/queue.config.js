import { QUEUE_CONFIG } from '../utils/global.constants.js';

export const QUEUE_NAMES = QUEUE_CONFIG.NAMES;

export const queueConfig = {
  rabbitmq: {
    url: process.env.RABBITMQ_URL || QUEUE_CONFIG.RABBITMQ.DEFAULT_URL,
    options: {
      username: process.env.RABBITMQ_USERNAME,
      password: process.env.RABBITMQ_PASSWORD,
      port: process.env.RABBITMQ_PORT,
      heartbeat: QUEUE_CONFIG.RABBITMQ.OPTIONS.HEARTBEAT,
      connectionTimeout: QUEUE_CONFIG.RABBITMQ.OPTIONS.CONNECTION_TIMEOUT,
    },
    reconnectDelay: QUEUE_CONFIG.RABBITMQ.OPTIONS.CONNECTION_TIMEOUT,
    queueOptions: {
      durable: QUEUE_CONFIG.RABBITMQ.QUEUE_OPTIONS.DURABLE,
      arguments: QUEUE_CONFIG.RABBITMQ.QUEUE_OPTIONS.ARGUMENTS,
    },
    queues: {
      [QUEUE_NAMES.FILE_UPLOAD]: {},
      [QUEUE_NAMES.FILE_DOWNLOAD]: {},
      [QUEUE_NAMES.DEAD_LETTER]: {},
    },
  },
  jobOptions: {
    attempts: Number(process.env.QUEUE_ATTEMPTS),
    backoff: Number(process.env.QUEUE_BACKOFF),
  },
};
