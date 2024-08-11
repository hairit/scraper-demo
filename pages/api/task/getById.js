const { connect, connected } = require("../../../db/connection");
const modelSchema = require("../../../db/models/CronJobSetting");

export default async function handler(req, res) {
  try {
    if (!connected) {
      await connect();
    }
    const item = await modelSchema
      .findById(req.query.id)
      .select("-__v -startTime");
    return res.json({ result: "OK", data: item });
  } catch (error) {
    return res.json({ result: "ERROR", message: error.message });
  }
}
