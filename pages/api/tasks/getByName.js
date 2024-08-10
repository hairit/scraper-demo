import { connect, connected } from "../../../db/connection";
const modelSchema = require("../../../db/models/CronJobSetting");

export default async function handler(req, res) {
  try {
    if (!connected) {
      await connect();
    }
    const item = await modelSchema.findOne({ taskName: req.query.name });
    res.json({ result: "OK", data: item });
  } catch (error) {
    return res.json({ result: "ERROR", message: error.message });
  }
}
