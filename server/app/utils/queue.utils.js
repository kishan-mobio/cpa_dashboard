import amqp from 'amqplib';
import { createLogger } from './logger.utils.js';
import { queueConfig } from '../config/queue.config.js';
import { LOG_MESSAGES } from './log_messages.utils.js';
import { EVENTS, QUEUE, TIME_CONSTANTS } from './global.constants.js';

const logger = createLogger('queue-service');

const createqueueUtils = () => {
  let connection = null;
  let channel = null;
  let reconnectTimeout = null;
  const activeJobs = new Map();
  const consumers = new Map();

  const setupChannel = async () => {
    logger.info(LOG_MESSAGES.SERVER.QUEUE.INITIALIZING);
    try {
      channel = await connection.createChannel();
      channel.on(EVENTS.ERROR, handleChannelError);
      channel.on(EVENTS.CLOSE, handleChannelClose);

      // Setup dead letter exchange
      await channel.assertExchange(
        QUEUE.EXCHANGE.DEAD_LETTER,
        QUEUE.EXCHANGE.TYPE.DIRECT,
        { durable: true }
      );
      await channel.assertQueue(QUEUE.NAMES.DEAD_LETTER, { durable: true });

      // Assert queues
      for (const [queueName] of Object.entries(queueConfig.rabbitmq.queues)) {
        await channel.assertQueue(queueName, {
          ...queueConfig.rabbitmq.queueOptions,
        });
      }
    } catch (error) {
      logger.error(
        LOG_MESSAGES.SERVER.QUEUE.QUEUE_SERVICE.QUEUE.SETUP.ERROR,
        error
      );
      throw error;
    }
  };

  const handleConnectionError = async (error) => {
    logger.error(
      LOG_MESSAGES.SERVER.QUEUE.QUEUE_SERVICE.CONNECTION.ERROR,
      error
    );
    await cleanup();
    scheduleReconnect();
  };

  const handleConnectionClose = async () => {
    logger.info(LOG_MESSAGES.SERVER.QUEUE.QUEUE_SERVICE.CONNECTION.CLOSED);
    await cleanup();
    scheduleReconnect();
  };

  const handleChannelError = (error) => {
    logger.error(LOG_MESSAGES.SERVER.QUEUE.QUEUE_SERVICE.CHANNEL.ERROR, error);
  };

  const handleChannelClose = () => {
    logger.info(LOG_MESSAGES.SERVER.QUEUE.QUEUE_SERVICE.CHANNEL.CLOSED);
  };

  const scheduleReconnect = () => {
    if (!reconnectTimeout) {
      logger.info(
        LOG_MESSAGES.SERVER.QUEUE.QUEUE_SERVICE.CONNECTION.RECONNECTING
      );
      reconnectTimeout = setTimeout(async () => {
        try {
          await initialize();
        } catch (error) {
          logger.error(
            LOG_MESSAGES.SERVER.QUEUE.QUEUE_SERVICE.CONNECTION.RECONNECT_FAILED,
            error
          );
          scheduleReconnect();
        }
      }, queueConfig.rabbitmq.reconnectDelay || 5000);
    }
  };

  const initialize = async () => {
    try {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }

      connection = await amqp.connect({
        ...queueConfig.rabbitmq.options,
        url: queueConfig.rabbitmq.url,
      });

      connection.on(EVENTS.ERROR, handleConnectionError);
      connection.on(EVENTS.CLOSE, handleConnectionClose);

      await setupChannel();

      // Restore consumers after reconnect
      for (const [queueName, consumer] of consumers.entries()) {
        await processQueue(queueName, consumer);
      }

      logger.info(LOG_MESSAGES.SERVER.QUEUE.QUEUE_SERVICE.INITIALIZED);
    } catch (error) {
      logger.error(LOG_MESSAGES.SERVER.QUEUE.QUEUE_SERVICE.INIT_FAILED, error);
      scheduleReconnect();
      throw error;
    }
  };

  const addJob = async (queueName, data) => {
    try {
      if (!channel) await initialize();

      const jobId = Date.now().toString();
      const jobData = {
        id: jobId,
        data,
        attempts: 0,
        timestamp: Date.now(),
      };

      await channel.sendToQueue(
        queueName,
        Buffer.from(JSON.stringify(jobData)),
        {
          persistent: true,
          messageId: jobId,
          timestamp: jobData.timestamp,
          expiration: TIME_CONSTANTS.QUEUE_JOB_TTL,
        }
      );

      activeJobs.set(jobId, jobData);
      return { queued: true, queueName, jobId };
    } catch (error) {
      logger.error(`Failed to add job to queue ${queueName}:`, error);
      throw error;
    }
  };

  const processQueue = async (queueName, processor) => {
    try {
      if (!channel) await initialize();

      channel.prefetch(1);
      consumers.set(queueName, processor);

      await channel.consume(queueName, async (msg) => {
        if (!msg) return;

        try {
          const jobData = JSON.parse(msg.content.toString());
          const { id, data } = jobData;

          logger.info(
            LOG_MESSAGES.SERVER.QUEUE.QUEUE_SERVICE.JOB.PROCESSING(
              id,
              queueName
            )
          );
          await processor(data);

          channel.ack(msg);
          activeJobs.delete(id);
          logger.info(
            LOG_MESSAGES.SERVER.QUEUE.QUEUE_SERVICE.JOB.COMPLETED(id)
          );
        } catch (error) {
          const jobData = JSON.parse(msg.content.toString());
          logger.error(
            LOG_MESSAGES.SERVER.QUEUE.QUEUE_SERVICE.JOB.PROCESS_ERROR(
              jobData.id
            ),
            error
          );

          if (jobData.attempts < queueConfig.jobOptions.attempts) {
            jobData.attempts += 1;
            logger.info(
              LOG_MESSAGES.SERVER.QUEUE.QUEUE_SERVICE.JOB.RETRY(
                jobData.id,
                jobData.attempts
              )
            );
            await addJob(queueName, jobData.data);
            channel.ack(msg);
          } else {
            logger.warn(
              LOG_MESSAGES.SERVER.QUEUE.QUEUE_SERVICE.JOB.MAX_ATTEMPTS(
                jobData.id
              )
            );
            channel.nack(msg, false, false);
            activeJobs.delete(jobData.id);
          }
        }
      });

      logger.info(
        LOG_MESSAGES.SERVER.QUEUE.QUEUE_SERVICE.QUEUE.STARTED(queueName)
      );
    } catch (error) {
      logger.error(
        LOG_MESSAGES.SERVER.QUEUE.QUEUE_SERVICE.QUEUE.PROCESS_FAILED(queueName),
        error
      );
      throw error;
    }
  };

  const cleanup = async () => {
    logger.info(LOG_MESSAGES.SERVER.QUEUE.QUEUE_SERVICE.CLEANUP.STARTED);
    try {
      await channel?.close();
      await connection?.close();
      activeJobs.clear();
      channel = null;
      connection = null;
      logger.info(LOG_MESSAGES.SERVER.QUEUE.QUEUE_SERVICE.CLEANUP.COMPLETED);
    } catch (error) {
      logger.error(
        LOG_MESSAGES.SERVER.QUEUE.QUEUE_SERVICE.CLEANUP.ERROR,
        error
      );
    }
  };

  return {
    initialize,
    addJob,
    processQueue,
    getJobStatus: (jobId) => activeJobs.get(jobId) || null,
    cleanup,
  };
};

export const queueUtils = createqueueUtils();
