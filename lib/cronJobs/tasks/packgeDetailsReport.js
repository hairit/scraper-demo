const fs = require("fs");
const path = require("path");
const { parse } = require("json2csv");
const CronJob = require("../cronJob");
const { run } = require("../../scrape");
const { CronJobSettingStatus } = require("../../global");
const { sendMail } = require("../../../utilities/mailer");
const { BASE_URL } = require("../../../utilities/constants");
const { CronJobHistory, CronJobStatus } = require("../cronJobHistory");

function execute(config, currentDate = null) {
  if (!currentDate) {
    currentDate = new Date();
  }
  let historyLog = new CronJobHistory(config);
  historyLog
    .JobStarted()
    .then(() => {
      return CronJob.UpdateCronJobSettingStatus(
        config,
        CronJobSettingStatus.Running
      );
    })
    .then(() => {
      const url = `https://main--scraper-demo.netlify.app/candidates`;
      const today = new Date();
      const endToday = new Date(Date.parse(today) + 24 * 60 * 60 * 1000);

      run(url, today.toISOString(), endToday.toISOString())
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
              "tuonghai.work@gmail.com",
              "",
              "",
              `[Temu] - Scraping data on package details completed > [${data.length}] record(s) extracted`,
              `<p>Hi, there is ${data.length} record(s) exported. Please download the csv file <a target="_blank" href="${fileUrl}">here</a>.</p><br />` +
                `<strong>Regards,</strong><br /><strong>Support team</strong>`
            );
          });
        })
        .catch((e) => console.log(e));
    })
    .then(
      (_) => historyLog.Log(undefined, CronJobStatus.Successful),
      (e) => historyLog.Log(`${e.message}`, CronJobStatus.Failed)
    )
    .finally(() => {
      historyLog.JobDone();
    });
}

exports.Execute = execute;
