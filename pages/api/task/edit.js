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
    let existItem = await modelSchema.findById(req.query.id);
    if (!existItem) {
      return res.json({
        result: "EMPTY",
        message: "Cron Job does not exist. Please try with other.",
      });
    }
    const startTime = moment(req.body.startDateTime).format("HH:mm");
    const cronStyle = ConvertToCronStyle(req.body.typeCronJob, startTime);
    await modelSchema
      .updateOne(
        { _id: req.query.id },
        {
          $set: {
            cronStyle: cronStyle,
            description: req.body.description,
            typeCronJob: req.body.typeCronJob,
            startTime: startTime,
            startDateTime: req.body.startDateTime,
            linkToReport: req.body.linkToReport,
            stepSize: req.body.stepSize,
            timeRun: 0,
            beforeDays: req.body.beforeDays,
          },
        }
      )
      .then(() => {
        if (
          existItem.cronStyle !== cronStyle &&
          existItem.status != CronJobSettingStatus.Stopped
        ) {
          const config = { ...existItem._doc, cronStyle: cronStyle };
          cronJob.RescheduleCronJob(config);
        }
      });
    return res.json({ result: "OK" });
  } catch (error) {
    return res.json({ result: "ERROR", message: error.message });
  }
}
