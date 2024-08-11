const modelSchema = require("../../../db/models/CronJobSetting");
const { cronJobTasks } = require("../../../lib/cronJobs/cronJobTasks");

export default async function handler(req, res) {
  try {
    let existItem = await modelSchema.findById(req.query.id);
    if (!existItem) {
      return res.json({
        result: "EMPTY",
        message: "Cron Job does not exist. Please try with other.",
      });
    }
    cronJobTasks[existItem.taskName].Execute(existItem);
    return res.json({ result: "OK" });
  } catch (error) {
    return res.json({ result: "ERROR", message: error.message });
  }
}
