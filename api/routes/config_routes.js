const indexR = require("./index");
const usersR = require("./users");
const studyRequestsR = require("./studyRequests");

exports.routesInit = (app) => {
  app.use("/",indexR);
  app.use("/users",usersR);
  app.use("/studyRequests",studyRequestsR)
}