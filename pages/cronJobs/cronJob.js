const Q = require("q");
const cronJob = require("node-schedule");
const { CronJobSettingStatus } = require("../global");
const cronJobSchema = require("../../db/models/CronJobSetting");
const logger = require("../../utilities/logger");
const { cronJobTasks } = require("./cronJobTasks");

function getCronJobConfig() {
  let deferred = Q.defer();
  cronJobSchema.find(
    { status: { $ne: CronJobSettingStatus.Stopped } },
    (err, data) => {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(data);
      }
    }
  );
  return deferred.promise;
}

function getNextTimeRun(setting) {
  let time = 60 * 60 * 1000;
  if (setting.typeCronJob === "Daily") {
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
        cronJobTasks[setting.taskName].Execute(setting, now);
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
  cronJobSchema.findOne({ taskName: taskName }, (err, data) => {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(data);
    }
  });
  return deferred.promise;
}

function updateCronJobSettingStatus(config, status) {
  let deferred = Q.defer();
  cronJobSchema.updateOne(
    { _id: config._id },
    {
      $set: {
        status: status,
        timeRun: config.timeRun,
      },
    },
    (err, data) => {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(data);
      }
    }
  );
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
