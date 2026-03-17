const express = require("express");
const app = express();
require("dotenv").config();

//extra security packages
const helmet = require("helmet");
const { xss } = require("express-xss-sanitizer");
const rateLimiter = require("express-rate-limit");

const cookieParser = require("cookie-parser");
const csrf = require("host-csrf");
app.use(cookieParser(process.env.SESSION_SECRET));
const csrfMiddleware = csrf.csrf();

app.set("view engine", "ejs");
app.use(require("body-parser").urlencoded({ extended: true }));

app.use(csrfMiddleware);

// connectDB
const connectDB = require("./db/connect");

const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const url = process.env.MONGO_URI;

const store = new MongoDBStore({
	// may throw an error, which won't be caught
	uri: url,
	collection: "mySessions",
});
store.on("error", function (error) {
	console.log(error);
});

const sessionParms = {
	secret: process.env.SESSION_SECRET,
	resave: true,
	saveUninitialized: true,
	store: store,
	cookie: { secure: false, sameSite: "strict" },
};

if (app.get("env") === "production") {
	app.set("trust proxy", 1);
	sessionParms.cookie.secure = true; // serve secure cookies
}

app.use(session(sessionParms));

const passport = require("passport");
const passportInit = require("./passport/passportInit");

passportInit();
app.use(passport.initialize());
app.use(passport.session());

app.use(require("connect-flash")());
app.use(require("./middleware/storeLocals"));

app.use((req, res, next) => {
	csrf.getToken(req, res);
	next();
});

// extra packages
app.set("trust proxy", 1); // for rate limiter to work properly behind a proxy
app.use(
	rateLimiter({
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: 100, // limit each IP to 100 requests per windowMs
	}),
);
app.use(helmet());
app.use(xss());

app.use((req, res, next) => {
	if (req.path == "/multiply") {
		res.set("Content-Type", "application/json");
	} else {
		res.set("Content-Type", "text/html");
	}
	next();
});

app.get("/", (req, res) => {
	res.render("index");
});
app.use("/sessions", require("./routes/sessionRoutes"));

// secret word handling
const auth = require("./middleware/auth");
const secretWordRouter = require("./routes/secretWord");
app.use("/secretWord", auth, secretWordRouter);

const plotRouter = require("./routes/plots");
app.use("/plots", auth, plotRouter);

app.get("/multiply", (req, res) => {
	const result = req.query.first * req.query.second;
	if (result.isNaN) {
		result = "NaN";
	} else if (result == null) {
		result = "null";
	}
	res.json({ result: result });
});

// 404 handling
const notFoundMiddleware = require("./middleware/not-found");
app.use(notFoundMiddleware);

const port = process.env.PORT || 3000;

const start = () => {
	try {
		let mongoURL = process.env.MONGO_URI;
		if (process.env.NODE_ENV == "test") {
			mongoURL = process.env.MONGO_URI_TEST;
		}
		connectDB(mongoURL);
		app.listen(port, () =>
			console.log(`Server is listening on port ${port}...`),
		);
	} catch (error) {
		console.log(error);
	}
};

start();

module.exports = { app };
