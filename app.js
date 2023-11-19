require("dotenv").config();
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");
const flash = require("connect-flash");
const session = require("express-session");
const Sentry = require("@sentry/node");
const { PORT = 3000, SENTRY_DSN, SESSION_SECRET_KEY } = process.env;

const router = require("./routes");

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: SESSION_SECRET_KEY,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [new Sentry.Integrations.Http({ tracing: true }), new Sentry.Integrations.Express({ app })],
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(router);

io.on("connection", (client) => {
  console.log("connected!");
});

app.use(Sentry.Handlers.errorHandler());

// 404 error handling
app.use((req, res, next) => {
  res.status(404).json({
    status: false,
    message: "Not Found",
  });
});

// 500 error handling
app.use((err, req, res, next) => {
  res.status(500).json({
    status: false,
    message: "Internal Server Error",
    data: null,
  });
});

server.listen(PORT, () => console.log(`server running at http://localhost:${PORT}`));
