const { until, By, Builder, Browser } = require("selenium-webdriver");

export default async function handler(req, res) {
  try {
    const driver = await new Builder().forBrowser(Browser.CHROME).build();
    await driver.get(req.query.url);
    const h1 = await driver.wait(until.elementLocated(By.xpath("//h1")), 10000);
    const title = await h1.getText();
    return res.json({
      title,
    });
  } catch (error) {
    res.json({
      result: "ERROR",
      message: error.message,
    });
  }
}
