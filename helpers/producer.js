const { Queue } = require('bullmq');
const queueName = 'job-queue';

const jobQueue = new Queue(queueName, {
   
 
  connection: {
    password: 'SsotkIrFGNrvdPMVsKJi3KcQPVMwXYTH',
    // socket: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
  // },
}});

const addJob = async (name,data) => {

    try {
      console.log("data sending",data)
      console.log("name",name)
      const job = await jobQueue.add(name,data); 
      console.log(`Job added to queue: ${job.id}`);
      return job;
  
      } catch (error) {
          console.error(error);
          throw error;
      }
  };
  module.exports = addJob;