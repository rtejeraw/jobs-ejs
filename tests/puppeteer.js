const puppeteer = require("puppeteer");
require("../app");
const { seed_db, testUserPassword } = require("../utils/seed_db");
const Plot = require("../models/Plot");
const get_chai = require("../utils/get_chai");

let testUser = null;

let page = null;
let browser = null;
// Launch the browser and open a new blank page
describe("plots-ejs puppeteer test", function () {
	before(async function () {
		this.timeout(5000);
		//await sleeper(5000)
		browser = await puppeteer.launch();
		page = await browser.newPage();
		await page.goto("http://localhost:3000");
	});
	after(async function () {
		this.timeout(5000);
		await browser.close();
	});
	describe("got to site", function () {
		it("should have completed a connection", async function () {});
	});
	describe("index page test", function () {
		this.timeout(5000);
		it("finds the index page logon link", async () => {
			this.logonLink = await page.waitForSelector(
				"a ::-p-text(Click this link to logon)",
			);
		});
		it("gets to the logon page", async () => {
			await this.logonLink.click();
			await page.waitForNavigation();
			const email = await page.waitForSelector('input[name="email"]');
		});
	});
	describe("logon page test", function () {
		this.timeout(20000);
		it("resolves all the fields", async () => {
			this.email = await page.waitForSelector('input[name="email"]');
			this.password = await page.waitForSelector(
				'input[name="password"]',
			);
			this.submit = await page.waitForSelector("button ::-p-text(Logon)");
		});
		it("sends the logon", async () => {
			testUser = await seed_db();
			await this.email.type(testUser.email);
			await this.password.type(testUserPassword);
			await this.submit.click();
			await page.waitForNavigation();
			await page.waitForSelector(
				`p ::-p-text(${testUser.name} is logged on.)`,
			);
			await page.waitForSelector("a ::-p-text(change the secret)");
			await page.waitForSelector('a[href="/secretWord"]');
			const copyr = await page.waitForSelector("p ::-p-text(copyright)");
			const copyrText = await copyr.evaluate((el) => el.textContent);
			console.log("copyright text: ", copyrText);
		});
	});

	describe("puppeteer plot operations", function () {
		this.timeout(5000);
		it("check the plot list", async () => {
			//finds the Plots page link
			this.plotsLink = await page.waitForSelector("a ::-p-text(Plots)");
			//gets to the Plots page
			await this.plotsLink.click();
			await page.waitForNavigation();
			const content = await page.content();
			const plotList = content.split("<tr>");
			console.log(`Plot list length: ${plotList.length}`);
		});
		it("get to new plot form", async () => {
			//finds the new Plot button
			this.newPlotButton = await page.waitForSelector(
				"button ::-p-text(New)",
			);
			//go to new Plot form
			await this.newPlotButton.click();
			await page.waitForNavigation();
			//resolve data fields and button
			this.unitTypeSelect = await page.waitForSelector(
				'select[name="unitType"]',
			);
			this.newPlotSubmit = await page.waitForSelector(
				"button ::-p-text(Save)",
			);
		});
		it("Add a plot to list", async () => {
			//check the database
			let plots = await Plot.find({ unitType: "Cabbage" });
			console.log(`Cabbage amount: ${plots.length}`);
			//add the new plot
			await this.unitTypeSelect.select("Cabbage");
			await this.newPlotSubmit.click();
			await page.waitForNavigation();
			//check the new entry message
			//Info: Entry added!
			await page.waitForSelector("div ::-p-text(Info: Entry added!)");
			//check the database
			plots = await Plot.find({ unitType: "Cabbage" });
			console.log(`Cabbage amount: ${plots.length}`);
		});
	});
});
