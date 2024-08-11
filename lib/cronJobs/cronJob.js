const Q = require("q");
const cronJob = require("node-schedule");
const logger = require("../../utilities/logger");
const { cronJobTasks } = require("./cronJobTasks");
const { CronJobSettingStatus } = require("../global");
const cronJobSchema = require("../../db/models/CronJobSetting");
const { CRON_JOB_TYPE_DAILY } = require("../../utilities/constants");

function getCronJobConfig() {
  let deferred = Q.defer();
  cronJobSchema
    .find({ status: { $ne: CronJobSettingStatus.Stopped } })
    .then((data) => {
      if (data) {
        deferred.resolve(data);
      } else {
        deferred.reject(new Error("Not found tasks"));
      }
    })
    .catch((err) => deferred.reject(err));
  return deferred.promise;
}

function getNextTimeRun(setting) {
  let time = 60 * 60 * 1000;
  if (setting.typeCronJob === CRON_JOB_TYPE_DAILY) {
    time = time * 24;
  }
  let from = new Date(setting.startDateTime.getTime());
  let to = new Date(
    from.setTime(from.getTime() + time * setting.stepSize * setting.timeRun)
  );
  return to;
}

function initialCronJob() {
  logger.info("Initial cron job.");
  getCronJobConfig().then(async (cronJobConfig) => {
    cronJobConfig.map((config) => {
      registerCronJob(config);
    });
    await resetRunTime();
  });
}

function registerCronJob(config) {
  var jobList = cronJob.scheduledJobs;
  if (jobList[config.taskName]) {
    jobList[config.taskName].cancel();
  }
  console.log("Register new cron job: " + config.taskName);
  logger.info("Register new cron job: " + config.taskName);
  cronJob.scheduleJob(config.taskName, config.cronStyle, () => {
    getCronJobConfigByName(config.taskName).then((source) => {
      let setting = { ...source._doc };
      const nextTimeRun = getNextTimeRun(setting);
      const now = new Date();
      logger.info(`Run task: ${now} - ${setting.startDateTime}`);
      if (setting.startDateTime <= now && nextTimeRun <= now) {
        setting.timeRun++;
        logger.info("Task execute " + setting.taskName);
        if (cronJobTasks[setting.taskName]) {
          cronJobTasks[setting.taskName].Execute(setting, now);
        } else {
          logger.error(`${setting.taskName} task was not configured`);
        }
      }
    });
  });
}

function destroyCronJob(taskName) {
  var jobList = cronJob.scheduledJobs;
  jobList[taskName]?.cancel();
}

function rescheduleCronJob(config) {
  var jobList = cronJob.scheduledJobs;
  jobList[config.taskName]?.reschedule(config.cronStyle);
}

function getCronJobConfigByName(taskName) {
  let deferred = Q.defer();
  cronJobSchema
    .findOne({ taskName: taskName })
    .then((data) => {
      if (data) {
        deferred.resolve(data);
      } else {
        deferred.reject(new Error(`${taskName} task not found`));
      }
    })
    .catch((err) => deferred.reject(err));
  return deferred.promise;
}

function updateCronJobSettingStatus(config, status) {
  let deferred = Q.defer();
  cronJobSchema
    .updateOne(
      { _id: config._id },
      {
        $set: {
          status: status,
          timeRun: config.timeRun,
        },
      }
    )
    .then((data) => deferred.resolve(data))
    .catch((err) => deferred.reject(err));
  return deferred.promise;
}

async function resetRunTime() {
  await cronJobSchema.updateMany(
    {},
    {
      $set: {
        timeRun: 0,
      },
    }
  );
}

exports.RegisterCronJob = registerCronJob;
exports.RescheduleCronJob = rescheduleCronJob;
exports.DestroyCronJob = destroyCronJob;
exports.InitialCronJob = initialCronJob;
exports.UpdateCronJobSettingStatus = updateCronJobSettingStatus;
