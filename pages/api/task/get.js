const { connect, connected } = require("../../../db/connection");
const modelSchema = require("../../../db/models/CronJobSetting");

export default async function handler(req, res) {
  try {
    if (!connected) {
      await connect();
    }
    const parsedItems = [];
    const items = await modelSchema.find().sort("taskName"); //.sort("processorId name -createdDate");
    if (items) {
      items.map((u) => {
        parsedItems.push(u);
      });
    }

    return res.json({ result: "OK", items: parsedItems });
  } catch (error) {
    return res.json({ result: "ERROR", message: error.message });
  }
}
