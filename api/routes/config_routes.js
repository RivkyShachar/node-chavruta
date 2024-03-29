const indexR = require("./index");
const usersR = require("./users");
const authR = require("./auth");
const apiR = require("./api");
const eventR = require("./event");
const zoomR = require("./zoom");
const studyRequestsR = require("./studyRequests");

exports.routesInit = (app) => {
  app.use("/",indexR);
  app.use("/users",usersR);
  app.use("/auth",authR);
  app.use("/api",apiR);
  app.use("/studyRequests",studyRequestsR);
  app.use("/event",eventR);
  app.use("/zoom",zoomR);
}