import { NextResponse } from "next/server";

const moment = require("moment");
const { parse } = require("json2csv");
const { until, By, Builder, Browser, Actions } = require("selenium-webdriver");

// const scrape = async () => {
//   const driver = await new Builder().forBrowser(Browser.CHROME).build();
//   await driver.get("https://logistics.temu.com/container/auth/login");
//   try {
//     // Login
//     const formLocated = until.elementLocated(By.css("form"));
//     const form = await driver.wait(formLocated, 10000);

//     const email = form.findElement(By.css("input[placeholder=Email]"));
//     const password = form.findElement(By.css("input[type=password]"));
//     const button = form.findElement(By.css("button[type=submit]"));
//     await email.sendKeys("datagather@drivehailify.com");
//     await password.sendKeys("Hailify2024!");
//     await button.click();

//     const logisticsManagementLocated = until.elementLocated(
//       By.css('a[data-report-click-text="Logistics Management"]')
//     );
//     const logisticsManagement = await driver.wait(
//       logisticsManagementLocated,
//       20000
//     );
//     await logisticsManagement.click();

//     // const listOfBillsLocated = until.elementLocated(
//     //   By.css(
//     //     'a[data-tracking-id="menu-Logistics Management-Logistics Management-List of bills of lading in transit-List of bills of lading in transit"]'
//     //   )
//     // );
//     const listOfBills = await logisticsManagement.findElement(
//       By.css('a[data-report-click-text="List of bills of lading in transit"]')
//     );
//     console.log(await listOfBills.getText());
//     await listOfBills.click();

//     // Navigate to page to be scraped
//   } catch (error) {
//     console.log(error.message);
//   } finally {
//     await driver.quit();
//   }
// };

// const xpathTest = async () => {
//   try {
//     const driver = await new Builder().forBrowser(Browser.CHROME).build();
//     await driver.get("https://ticketcrusader.com/");

//     const navigation = driver.findElement(
//       By.xpath("//ul[@id='navigation-items']")
//     );
//     const navigationItems = await navigation.findElements(
//       By.xpath('./*[contains(@class, "navigation-item")]')
//     );
//     navigationItems.forEach((element) => {
//       element.getText().then((text) => console.log(text));
//     });

//     const invisibleItem = await navigation.findElement(
//       By.xpath('./*[contains(@class, "sub-nav-right")]')
//     );
//     console.log(invisibleItem);
//   } catch (error) {
//     console.log(error);
//   } finally {
//   }
// };

// const invisibleElementTest = async () => {
//   try {
//     const driver = await new Builder().forBrowser(Browser.CHROME).build();
//     await driver.get("https://ticketcrusader.com/");

//     const navigation = driver.findElement(
//       By.xpath("//ul[@id='navigation-items']")
//     );
//     const navigationItem = await navigation.findElement(
//       By.xpath('./*[contains(@class, "navigation-item")][4]')
//     );
//     await driver.actions().move({ origin: navigationItem }).perform();
//     const invisibleItem = await driver.findElement(
//       By.xpath('//*[contains(@class, "sub-nav-right")]')
//     );
//     await invisibleItem.click();
//   } catch (error) {
//     console.log(error);
//   } finally {
//   }
// };

const scrapeStudentsIwsp = async (name) => {
  const driver = await new Builder().forBrowser(Browser.CHROME).build();
  await driver.get("https://growpro.fxwebapps.com/auth/login");
  try {
    // Find login elements
    const loginFormLocated = until.elementLocated(By.className("form-default"));
    const loginForm = await driver.wait(loginFormLocated, 10000);
    const emailInput = loginForm.findElement(By.id("email"));
    const passwordInput = loginForm.findElement(By.id("password"));
    // Login
    await emailInput.sendKeys("faisalfxmweb+pa1@gmail.com");
    await passwordInput.sendKeys("Password@12345");
    await loginForm.submit();
    // Navigate to users page
    const usersNav = await driver.wait(
      until.elementLocated(By.css('a[href="/portal/user"]')),
      10000
    );
    await usersNav.click();

    if (name && name.trim()) {
      const filterInput = await driver.wait(
        until.elementLocated(By.css("input[type=text]")),
        10000
      );
      await filterInput.sendKeys(name);
      await delay(2000);
    }

    const perPageDropdown = await driver.wait(
      until.elementLocated(By.xpath('//select[contains(@class, "sc-cwSeag")]')),
      10000
    );
    const perPageItem = perPageDropdown.findElement(
      By.xpath("./option[@selected]")
    );
    const perPage = await perPageItem.getText();
    const pagingText = await driver
      .findElement(By.className("sc-bYMpWt sc-kMjNwy KQKvZ hecCuC"))
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
          name: await row.findElement(By.xpath("./div[2]")).getText(),
          organization: await row.findElement(By.xpath("./div[3]")).getText(),
          programme: await row.findElement(By.xpath("./div[4]")).getText(),
          email: await row.findElement(By.xpath("./div[5]")).getText(),
        });
      }
      const nextBtn = await driver.findElement(By.id("pagination-next-page"));
      await driver.actions().move({ origin: nextBtn }).click().perform();
    }
    console.table(data);
  } catch (error) {
    console.log(error);
  } finally {
    //driver.quit();
  }
};

const run = async (req) => {
  const startProcess = new Date();
  const driver = await new Builder().forBrowser(Browser.CHROME).build();
  await driver.get(req.query.url);

  const from = new Date(req.query.from);
  const yearFrom = moment(from).format("YYYY");
  const monthFrom = moment(from).format("MMM");
  const dateFrom = moment(from).format("YYYY-MM-DD");

  const dateRangeStart = await driver.findElement(
    By.css('input[date-range="start"]')
  );
  await dateRangeStart.click();

  (await getYearHeaders(driver))[0].click();

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

  let datePicker = await getPicker(
    driver,
    "ant-picker-panel-container ant-picker-date-panel-container"
  );
  const selectedDateFrom = await getTargetDateItem(datePicker, dateFrom);
  await selectedDateFrom.click();

  (await getYearHeaders(driver))[0].click();

  const to = new Date(req.query.to);
  const yearTo = moment(to).format("YYYY");
  const monthTo = moment(to).format("MMM");
  const dateTo = moment(to).format("YYYY-MM-DD");

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

  datePicker = await getPicker(
    driver,
    "ant-picker-panel-container ant-picker-date-panel-container"
  );

  const selectedDateTo = await getTargetDateItem(datePicker, dateTo);
  await selectedDateTo.click();

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

  return data;
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
  console.log(dateItems.map((a) => a.text));
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
  run(req)
    .then((data) => {
      const csv = parse(data);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=data-scraped.csv"
      );
      return res.send(csv);
    })
    .catch((error) =>
      res.json({
        result: "ERROR",
        message: error.message,
      })
    );
}
