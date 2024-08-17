const fs = require("fs");
const path = require("path");
const moment = require("moment");
const { parse } = require("json2csv");
import { sendMail } from "../../../utilities/mailer";
const { until, By, Builder, Browser } = require("selenium-webdriver");

export const run = async (url, start, end) => {
  const startProcess = new Date();
  const driver = await new Builder().forBrowser(Browser.CHROME).build();
  await driver.get(url);

  const from = moment(new Date(start));
  const yearFrom = from.format("YYYY");
  const monthFrom = from.format("MMM");
  const dateFrom = from.format("YYYY-MM-DD");

  const dateRangeStart = await driver.findElement(
    By.css('input[date-range="start"]')
  );
  await dateRangeStart.click();
  await delay(1000);

  (await getYearHeaders(driver))[0].click();
  await delay(1000);

  let yearPicker = await getPicker(
    driver,
    "ant-picker-panel-container ant-picker-year-panel-container"
  );

  let selectedYearFrom = await getTargetYearItem(yearPicker, yearFrom);
  if (!selectedYearFrom) {
    const direction =
      parseInt(yearFrom) < startProcess.getFullYear() ? `prev` : `next`;
    const yearLookupBtn = driver.wait(
      until.elementLocated(By.className(`ant-picker-super-${direction}-icon`)),
      10000
    );
    while (!selectedYearFrom) {
      await yearLookupBtn.click();
      await delay(1000);
      selectedYearFrom = await getTargetYearItem(yearPicker, yearFrom);
    }
  }
  await selectedYearFrom.click();

  let monthPicker = await getPicker(
    driver,
    "ant-picker-panel-container ant-picker-month-panel-container"
  );
  const selectedMonthFrom = await getTargetMonthItem(monthPicker, monthFrom);
  await selectedMonthFrom.click();
  await delay(1000);

  let datePicker = await getPicker(
    driver,
    "ant-picker-panel-container ant-picker-date-panel-container"
  );
  const selectedDateFrom = await getTargetDateItem(datePicker, dateFrom);
  await selectedDateFrom.click();
  await delay(1000);

  (await getYearHeaders(driver))[1].click();
  await delay(1000);

  const to = moment(new Date(end));
  const yearTo = to.format("YYYY");
  const monthTo = to.format("MMM");
  const dateTo = to.format("YYYY-MM-DD");

  yearPicker = await getPicker(
    driver,
    "ant-picker-panel-container ant-picker-year-panel-container"
  );

  let selectedYearTo = await getTargetYearItem(yearPicker, yearTo);
  if (!selectedYearTo) {
    const direction = parseInt(yearTo) < parseInt(yearFrom) ? `prev` : `next`;
    const yearLookupBtn = driver.wait(
      until.elementLocated(By.className(`ant-picker-super-${direction}-icon`)),
      10000
    );
    while (!selectedYearTo) {
      await yearLookupBtn.click();
      await delay(1000);
      selectedYearTo = await getTargetYearItem(yearPicker, yearTo);
    }
  }
  await selectedYearTo.click();

  monthPicker = await getPicker(
    driver,
    "ant-picker-panel-container ant-picker-month-panel-container"
  );

  const selectedMonthTo = await getTargetMonthItem(monthPicker, monthTo);
  await selectedMonthTo.click();
  await delay(1000);

  datePicker = await getPicker(
    driver,
    "ant-picker-panel-container ant-picker-date-panel-container"
  );

  const selectedDateTo = await getTargetDateItem(datePicker, dateTo);
  await selectedDateTo.click();
  await delay(1000);

  const perPageDropdown = await driver.wait(
    until.elementLocated(By.xpath('//select[contains(@class, "sc-bSlUec")]')),
    10000
  );
  await perPageDropdown.click();

  let perPage = 100;
  let perPageItem = null;
  const perPageItems = await perPageDropdown.findElements(By.xpath("./option"));
  for (let i = 0; i < perPageItems.length; i++) {
    const text = await perPageItems[i].getText();
    if (text.toString() === perPage.toString()) {
      perPageItem = perPageItems[i];
    }
  }
  await perPageItem.click();
  await delay(2000);

  const pagingText = await driver
    .findElement(By.className("sc-irEpRR sc-dJDBYC ipSHVm YIXGw"))
    .getText();
  const pagingInfo = pagingText
    .split("of")
    .map((t) => t.trim())
    .filter((t) => t);
  const pages = Math.ceil(parseInt(pagingInfo[1]) / perPage);

  let data = [];
  for (let page = 0; page < pages; page++) {
    await delay(2000);

    const rows = await driver.wait(
      until.elementsLocated(By.className("rdt_TableRow")),
      10000
    );
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      data.push({
        name: await row.findElement(By.xpath("./div[1]")).getText(),
        position: await row.findElement(By.xpath("./div[2]")).getText(),
        salary: await row.findElement(By.xpath("./div[3]")).getText(),
        interviewDate: await row.findElement(By.xpath("./div[4]")).getText(),
        status: await row.findElement(By.xpath("./div[5]")).getText(),
        notes: await row.findElement(By.xpath("./div[6]")).getText(),
      });
    }
    const nextBtn = await driver.findElement(By.id("pagination-next-page"));
    await driver.actions().move({ origin: nextBtn }).click().perform();
  }

  return { data, from, to };
};

const getPicker = async (driver, pickerClass) => {
  return driver.wait(until.elementLocated(By.className(pickerClass)), 10000);
};

const getYearHeaders = async (driver) => {
  await driver.wait(
    until.elementLocated(By.className("ant-picker-year-btn")),
    10000
  );
  return await driver.findElements(By.className("ant-picker-year-btn"));
};

const getTargetYearItem = async (yearPicker, targetYear) => {
  const yearRows = await yearPicker.findElements(By.xpath(".//table/tbody/tr"));
  let yearItems = [];
  for (let i = 0; i < yearRows.length; i++) {
    const row = yearRows[i];
    const items = await row.findElements(By.xpath("./td"));
    yearItems = yearItems.concat(items);
  }
  await getTexts(yearItems);
  return yearItems.find((item) => item.text === targetYear);
};

const getTargetMonthItem = async (monthPicker, targetMonth) => {
  const monthRows = await monthPicker.findElements(
    By.xpath(".//table/tbody/tr")
  );
  let monthItems = [];
  for (let i = 0; i < monthRows.length; i++) {
    const row = monthRows[i];
    const items = await row.findElements(By.xpath("./td"));
    monthItems = monthItems.concat(items);
  }
  await getTexts(monthItems);
  return monthItems.find((item) => item.text === targetMonth);
};

const getTargetDateItem = async (datePicker, targetDate) => {
  const dateRows = await datePicker.findElements(
    By.xpath(".//table[1]/tbody/tr")
  );
  let dateItems = [];
  for (let i = 0; i < dateRows.length; i++) {
    const row = dateRows[i];
    const items = await row.findElements(By.xpath("./td"));
    dateItems = dateItems.concat(items);
  }
  for (let i = 0; i < dateItems.length; i++) {
    const item = dateItems[i];
    item.text = await item.getAttribute("title");
  }
  return dateItems.find((item) => item.text === targetDate);
};

const getTexts = async (elements) => {
  let texts = [];
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const text = await element.getText();
    element.text = text;
    texts.push(text);
  }
  return texts;
};

const delay = (seconds) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, seconds);
  });
};

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
        `public/temp/${fileName}`
      );
      fs.writeFile(filePath, csv, (error) => {
        if (error) {
          console.log(`Could not save temp file:`, error);
          return;
        }
        const formData = new FormData();
        formData.append("csv", fs.createReadStream(filePath));
        fetch(`${req.query.domain}/api/scrape/upload`, {
          method: "POST",
          body: formData,
        })
          .then(() => {
            const fileUrl = `${req.query.url}/uploads/${fileName}`;
            sendMail(
              "",
              req.query.sendTo ?? "tuonghai.contact@gmail.com",
              "",
              "",
              `[Temu] - Scraping data on package details completed > [${data.length}] record(s) extracted`,
              `<p>Hi, there is ${data.length} record(s) exported. Please download the csv file <a target="_blank" href="${fileUrl}">here</a><br />.</p><br />` +
                `<strong>Regards,</strong><br /><strong>Support team</strong>`
            );
          })
          .catch((error) => console.log(error))
          .finally(() => {
            fs.unlink(filePath, (e) => {
              if (e) console.log("Could not delete the file after execute.");
            });
          });
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
