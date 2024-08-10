const moment = require("moment");
const cronJob = require("../../../lib/cronJobs/cronJob");
const { CronJobSettingStatus } = require("../../../lib/global");
const modelSchema = require("../../../db/models/CronJobSetting");

const typeCronJob = {
  Hourly: "Hourly",
  Daily: "Daily",
};

function ConvertToCronStyle(type, startTime) {
  const time = startTime.split(":");
  let cronStyle = "0 * * * *";
  if (type == typeCronJob.Hourly) {
    cronStyle = `${time[1]} * * * *`;
  } else if (type == typeCronJob.Daily) {
    cronStyle = `${time[1]} ${time[0]} * * *`;
  }
  return cronStyle;
}

export default async function handler(req, res) {
  try {
    const taskName = req.body.taskName.trim();
    var regex = new RegExp(["^", taskName, "$"].join(""), "i");
    const existItem = await modelSchema.findOne({
      taskName: regex,
    });
    if (existItem) {
      return res.json({
        result: "EXIST",
        message: "Task already exists in this name. Please try with other.",
      });
    }
    const startTime = moment(req.body.startDateTime).format("HH:mm");
    const cronStyle = ConvertToCronStyle(req.body.typeCronJob, startTime);
    const newItem = new modelSchema({
      taskName: req.body.taskName,
      cronStyle: cronStyle,
      status: CronJobSettingStatus.Scheduled,
      description: req.body.description,
      typeCronJob: req.body.typeCronJob,
      startTime: startTime,
      startDateTime: req.body.startDateTime,
      linkToReport: req.body.linkToReport,
      stepSize: req.body.stepSize,
      beforeDays: req.body.beforeDays,
    });
    newItem.save((exception, savedJob) => {
      if (exception) {
        return res.json({
          result: "ERROR",
          message: exception.message,
        });
      }
      if (savedJob) {
        cronJob.RegisterCronJob(newItem);
        return res.json({
          result: "OK",
          data: { _id: savedJob._id, name: savedJob.taskName },
        });
      }
    });
  } catch (error) {
    return res.json({ result: "ERROR", message: error.message });
  }
}
