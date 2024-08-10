const { InitialCronJob } = require("../../../lib/cronJobs/cronJob");

export default async function handler(req, res) {
  try {
    InitialCronJob();
    return res.json({ result: "OK" });
  } catch (error) {
    return res.json({ result: "ERROR", message: error.message });
  }
}
