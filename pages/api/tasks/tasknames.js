const modelSchema = require("../../../db/models/CronJobSetting");

export default async function handler(req, res) {
  try {
    await modelSchema.find({}, (err, data) => {
      const taskSetting = data.map((item) => {
        return { taskId: item._id, taskName: item.taskName };
      });
      return res.json({ result: "OK", data: taskSetting });
    });
  } catch (error) {
    return res.json({ result: "ERROR", message: error.message });
  }
}
