const { parse } = require("json2csv");
const CronJob = require("../cronJob");
const { CronJobSettingStatus } = require("../../global");
const { run } = require("../../../pages/api/scrape/run");
const { sendMail } = require("../../../utilities/mailer");
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
      const today = new Date();
      const endToday = new Date(Date.parse(today) + 24 * 60 * 60 * 1000);
      run(
        "https://main--scraper-demo.netlify.app/candidates",
        today.toISOString(),
        endToday.toISOString()
      )
        .then(({ data, from, to }) => {
          const csv = parse(data);
          sendMail(
            "",
            "tuonghai.contact@gmail.com",
            "",
            "",
            `[Temu] - Scraping data on package details completed > [${data.length}] records extracted`,
            `<p>Hi, there is ${data.length} record(s) exported. Please download the attached file.</p><br /><strong>Regards,</strong><br /><strong>Support team</strong>`,
            [
              {
                filename: `scraped-candidates-${from.format(
                  "MM-DD-YYYY"
                )}-${to.format("MM-DD-YYYY")}.txt`,
                content: csv,
              },
            ]
          );
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
