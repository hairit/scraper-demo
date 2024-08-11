const moment = require("moment");
const cronJob = require("../../../lib/cronJobs/cronJob");
const { ConvertToCronStyle } = require("../../../utilities");
const { CronJobSettingStatus } = require("../../../lib/global");
const { connect, connected } = require("../../../db/connection");
const modelSchema = require("../../../db/models/CronJobSetting");

export default async function handler(req, res) {
  try {
    if (!connected) {
      await connect();
    }
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
