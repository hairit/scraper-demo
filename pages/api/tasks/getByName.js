const modelSchema = require("../../../db/models/CronJobSetting");

export default async function handler(req, res) {
  try {
    const item = await modelSchema.findOne({ taskName: req.query.name });
    res.json({ result: "OK", data: item });
  } catch (error) {
    return res.json({ result: "ERROR", message: error.message });
  }
}
