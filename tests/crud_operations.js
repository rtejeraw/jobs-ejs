const { app } = require("../app");
const get_chai = require("../utils/get_chai");
const { factory, seed_db, testUserPassword } = require("../utils/seed_db");

describe("tests for CRUD", function () {
	before(async () => {
		const { expect, request } = await get_chai();
		this.test_user = await seed_db();
		let req = request.execute(app).get("/sessions/logon").send();
		let res = await req;
		const textNoLineEnd = res.text.replaceAll("\n", "");
		this.csrfToken = /_csrf\" value=\"(.*?)\"/.exec(textNoLineEnd)[1];
		let cookies = res.headers["set-cookie"];
		this.csrfCookie = cookies.find((element) =>
			element.startsWith("__Host-csrfToken="),
		);
		const dataToPost = {
			email: this.test_user.email,
			password: testUserPassword,
			_csrf: this.csrfToken,
		};
		req = request
			.execute(app)
			.post("/sessions/logon")
			.set("Cookie", this.csrfCookie)
			.set("content-type", "application/x-www-form-urlencoded")
			.redirects(0)
			.send(dataToPost);
		res = await req;
		cookies = res.headers["set-cookie"];
		this.sessionCookie = cookies.find((element) =>
			element.startsWith("connect.sid"),
		);
		expect(this.csrfToken).to.not.be.undefined;
		expect(this.sessionCookie).to.not.be.undefined;
		expect(this.csrfCookie).to.not.be.undefined;
	});

	it("should get the plot list", async () => {
		const { expect, request } = await get_chai();
		const req = request
			.execute(app)
			.get("/plots")
			.set("Cookie", this.csrfCookie)
			.set("Cookie", this.sessionCookie)
			.send();
		const res = await req;
		expect(res).to.have.status(200);
		expect(res).to.have.property("text");

		const pageParts = res.text.split("<tr>");
		expect(pageParts.length).to.equal(21);
	});

	it("should add a plot entry", async () => {
		this.newPlot = await factory.build("plot", {
			userId: this.test_user._id,
		});
		const dataToPost = {
			_csrf: this.csrfToken,
			userId: this.newPlot.userId,
			unitType: this.newPlot.unitType,
		};
		const { expect, request } = await get_chai();
		const req = request
			.execute(app)
			.post("/plots")
			.set("Cookie", this.csrfCookie)
			.set("content-type", "application/x-www-form-urlencoded")
			.send(dataToPost);
		const res = await req;
		expect(res).to.have.status(200);
		expect(res).to.have.property("headers");
		expect(res).to.have.property("text");
		expect(res.text).to.include("Click this link to logon");
	});
});
