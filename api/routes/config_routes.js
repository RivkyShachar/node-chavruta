const indexR = require("./index");
const usersR = require("./users");
const authR = require("./auth");
const studyRequestsR = require("./studyRequests");

exports.routesInit = (app) => {
  app.use("/",indexR);
  app.use("/users",usersR);
  app.use("/auth",authR);
  app.use("/studyRequests",studyRequestsR)
}