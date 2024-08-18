const fs = require("fs");
const path = require("path");
const { parse } = require("json2csv");
const { run } = require("../../../lib/scrape");
const { sendMail } = require("../../../utilities/mailer");
const { BASE_URL } = require("../../../utilities/constants");

export default async function handler(req, res) {
  run(req.query.url, req.query.from, req.query.to)
    .then(({ data, from, to }) => {
      const csv = parse(data);
      const fileName = `data-${from.format("MM-DD-YYYY")}-${to.format(
        "MM-DD-YYYY"
      )}.csv`;
      const filePath = path.join(
        __dirname,
        "../../../../../",
        `public/uploads/${fileName}`
      );
      fs.writeFile(filePath, csv, (error) => {
        if (error) {
          console.log(`Could not save csv file:`, error);
          return;
        }
        const fileUrl = `${BASE_URL}/uploads/${fileName}`;
        sendMail(
          "",
          req.query.sendTo ?? "tuonghai.contact@gmail.com",
          "",
          "",
          `[Temu] - Scraping data on package details completed > [${data.length}] record(s) extracted`,
          `<p>Hi, there is ${data.length} record(s) exported. Please download the csv file <a target="_blank" href="${fileUrl}">here</a>.</p><br />` +
            `<strong>Regards,</strong><br /><strong>Support team</strong>`
        );
      });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
      return res.send(csv);
    })
    .catch((error) =>
      res.json({
        result: "ERROR",
        message: error.message,
      })
    );
}
