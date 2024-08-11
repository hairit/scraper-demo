const cronJob = require("../../../lib/cronJobs/cronJob");
const { getNextStartDateTime } = require("../../../utilities");
const { CronJobSettingStatus } = require("../../../lib/global");
const { connect, connected } = require("../../../db/connection");
const modelSchema = require("../../../db/models/CronJobSetting");

export default async function handler(req, res) {
  try {
    if (!connected) {
      await connect();
    }
    const setFields = {
      status: req.body.status,
      timeRun: 0,
    };
    let existItem = await modelSchema.findById(req.query.id);
    if (!existItem) {
      return res.json({
        result: "EMPTY",
        message: "Cron Job does not exist. Please try with other.",
      });
    }
    const currentDate = new Date();
    if (
      setFields.status !== CronJobSettingStatus.Stopped &&
      existItem.startDateTime <= currentDate
    ) {
      setFields.startDateTime = getNextStartDateTime(existItem, currentDate);
    }
    await modelSchema
      .updateOne(
        { _id: req.query.id },
        {
          $set: setFields,
        }
      )
      .then(() => {
        if (setFields.status === CronJobSettingStatus.Stopped) {
          cronJob.DestroyCronJob(existItem.taskName);
        } else {
          cronJob.RegisterCronJob(existItem);
        }
      });
    return res.json({
      result: "OK",
      data: {
        startDateTime: setFields.startDateTime,
      },
    });
  } catch (error) {
    return res.json({ result: "ERROR", message: error.message });
  }
}
