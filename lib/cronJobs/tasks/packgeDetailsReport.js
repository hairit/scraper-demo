const CronJob = require("../cronJob");
const { CronJobSettingStatus } = require("../../global");
const { CronJobHistory, CronJobStatus } = require("../cronJobHistory");

function execute(config, currentDate = null) {
  if (!currentDate) {
    currentDate = new Date();
  }
  let historyLog = new CronJobHistory(config);
  historyLog
    .JobStarted()
    .then(() => {
      return CronJob.UpdateCronJobSettingStatus(
        config,
        CronJobSettingStatus.Running
      );
    })
    .then(() => {
      console.log("Test task has just been executed");
    })
    .then(
      (_) => historyLog.Log(undefined, CronJobStatus.Successful),
      (e) => historyLog.Log(`${e.message}`, CronJobStatus.Failed)
    )
    .finally(() => {
      historyLog.JobDone();
    });
}

exports.Execute = execute;
