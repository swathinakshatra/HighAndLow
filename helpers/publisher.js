const { Worker } = require('bullmq');
const redisConnection = {
  connection: {
    password: process.env.REDIS_AUTH,
    socket: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    },
  },
};

const processUpdateJob = require('../helpers/consumer');

new Worker(
  'job-queue',
  async (job) => {
    try {
      console.log(`----->Processing job ${job.id} of type ${job.name}`);
      if (job.name === 'update') {
        const result = await processUpdateJob(job.data);
        console.log('Job result:', result);
      } else {
        throw new Error('Unknown job type');
      }
      console.log(`Job ${job.id} completed successfully`);
    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error);
      throw error;
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_AUTH,
    },
  }
);
