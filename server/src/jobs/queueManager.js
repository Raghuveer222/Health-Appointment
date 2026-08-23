const { Queue, Worker } = require('bullmq');
const { initRedis, getRedisStatus } = require('../config/redis');
const { logEvent } = require('../utils/logger');

// Internal in-memory fallback queue store
const inMemoryQueues = {};

/**
 * Add job to queue (BullMQ or in-memory fallback)
 */
const addJob = async (queueName, jobName, data, options = {}) => {
  const { redisClient, isRedisAvailable } = initRedis();

  if (isRedisAvailable && redisClient) {
    try {
      if (!inMemoryQueues[queueName]?.bullQueue) {
        inMemoryQueues[queueName] = inMemoryQueues[queueName] || {};
        inMemoryQueues[queueName].bullQueue = new Queue(queueName, {
          connection: redisClient,
        });
      }
      const job = await inMemoryQueues[queueName].bullQueue.add(jobName, data, {
        attempts: options.attempts || 4,
        backoff: options.backoff || { type: 'exponential', delay: 1000 },
        delay: options.delay || 0,
      });
      logEvent('Queue', `Job [${jobName}] added to BullMQ queue [${queueName}] with ID ${job.id}`);
      return job;
    } catch (err) {
      logEvent('Queue Warning', `BullMQ add failed: ${err.message}. Switching to in-memory processing.`);
    }
  }

  // In-Memory Fallback Job Runner
  logEvent('Queue', `Processing job [${jobName}] via in-memory worker queue [${queueName}]`);
  const processInMemoryJob = async (attempt = 1) => {
    try {
      const handler = inMemoryQueues[queueName]?.handler;
      if (handler) {
        await handler({ name: jobName, data });
        logEvent('Queue Success', `In-memory job [${jobName}] completed successfully.`);
      }
    } catch (err) {
      logEvent('Queue Failure', `In-memory job [${jobName}] attempt ${attempt} failed: ${err.message}`);
      const maxAttempts = options.attempts || 3;
      if (attempt < maxAttempts) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        setTimeout(() => processInMemoryJob(attempt + 1), backoffMs);
      } else {
        logEvent('Queue Error', `In-memory job [${jobName}] permanently failed after ${maxAttempts} attempts.`);
      }
    }
  };

  if (options.delay) {
    setTimeout(() => processInMemoryJob(1), options.delay);
  } else {
    setImmediate(() => processInMemoryJob(1));
  }

  return { id: `inmem_${Date.now()}`, name: jobName, data };
};

/**
 * Register worker handler for a queue
 */
const registerWorker = (queueName, processor) => {
  inMemoryQueues[queueName] = inMemoryQueues[queueName] || {};
  inMemoryQueues[queueName].handler = processor;

  const { redisClient, isRedisAvailable } = initRedis();

  if (isRedisAvailable && redisClient) {
    try {
      const worker = new Worker(queueName, processor, {
        connection: redisClient,
      });
      worker.on('completed', (job) => logEvent('Worker', `BullMQ job ${job.id} completed.`));
      worker.on('failed', (job, err) => logEvent('Worker Error', `BullMQ job ${job?.id} failed: ${err.message}`));
      return worker;
    } catch (err) {
      logEvent('Worker Warning', `Could not attach BullMQ worker: ${err.message}`);
    }
  }
};

module.exports = {
  addJob,
  registerWorker,
};
