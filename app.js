require("dotenv").config();
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");
const { PORT = 3000 } = process.env;

const router = require("./routes");

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.use(router);

io.on("connection", (client) => {
  console.log("new user connected!");

  // subscribe topik 'chat message'
  client.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });
});

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

app.listen(PORT, () => console.log(`server running at http://localhost:${PORT}`));
