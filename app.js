const express = require("express");
const path = require("path");
const http = require("http");
const cors = require("cors");
const {routesInit} = require("./api/routes/config_routes");
const {updateStudyRequestStates} = require("./api/helpers/scheduler")
require("./api/db/mongoconnect");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname,"public")))

routesInit(app);

const server = http.createServer(app);

let port = process.env.PORT || 3001
server.listen(port);
setInterval(updateStudyRequestStates, 60 * 60 * 1000);