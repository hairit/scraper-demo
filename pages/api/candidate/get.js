import { connect, connected } from "../../../db/connection";
import modelSchema from "../../../db/models/Candidate";

export default async function handler(req, res) {
  try {
    if (!connected) {
      await connect();
    }
    let page = parseInt(req.query.page);
    let perPage = parseInt(req.query.perPage);
    let interviewDateFrom = req.query.from;
    let interviewDateTo = req.query.to;
    page = isNaN(page) ? 1 : page;
    perPage = isNaN(perPage) ? 10 : perPage;

    const condition = {};
    if (interviewDateFrom) {
      condition.interviewDate = { $gte: interviewDateFrom };
    }
    if (interviewDateTo) {
      if (condition.interviewDate) {
        condition.interviewDate.$lte = interviewDateTo;
      } else {
        condition.interviewDate = { $lte: interviewDateTo };
      }
    }
    const totalCount = await modelSchema.countDocuments(condition);
    const items = await modelSchema
      .find(condition)
      .skip((page - 1) * perPage)
      .limit(perPage);

    return res.json({
      items,
      totalCount,
    });
  } catch (error) {
    return res.json({ result: "ERROR", message: error.message });
  }
}
