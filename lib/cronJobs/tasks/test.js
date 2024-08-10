const CronJob = require("../cronJob");
const { CronJobHistory, CronJobStatus } = require("../cronJobHistory");
const { CronJobSettingStatus } = require("../../global");

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
      (messages) => {
        if (Array.isArray(messages) && messages.length) {
          messages.forEach((m) => {
            const historyLogMessage = {
              email: m.studentEmail,
              name: m.studentName,
              studentId: m.studentId,
              message: m.message,
            };
            historyLog.Log(historyLogMessage, CronJobStatus.Successful);
          });
        } else {
          historyLog.Log(undefined, CronJobStatus.Successful);
        }
      },
      (exception) => {
        historyLog.Log(`${exception.message}`, CronJobStatus.Failed);
      }
    )
    .finally(() => {
      historyLog.JobDone();
    });
}

exports.Execute = execute;
