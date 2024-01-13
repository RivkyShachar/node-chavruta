const express = require("express");
const path = require("path");
const http = require("http");
const cors = require("cors");
const {routesInit} = require("./api/routes/config_routes");
const {updateStudyRequestStates} = require("./api/helpers/scheduler")
require("./api/db/mongoconnect");
const cron = require('node-cron');
const { ZoomRequestModel } = require('./api/models/zoomRequestModel');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname,"public")))

// Schedule a job to run every minute to check and remove expired requests
cron.schedule('* * * * *', async () => {
    const tenMinutesAgo = new Date();
    tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);
  
    try {
      // Remove requests older than 10 minutes
      await ZoomRequestModel.deleteMany({ timestamp: { $lt: tenMinutesAgo } });
      console.log('Expired requests removed.');
    } catch (error) {
      console.error('Error removing expired requests:', error.message);
    }
  });

routesInit(app);

const server = http.createServer(app);

let port = process.env.PORT || 3001
server.listen(port);
setInterval(updateStudyRequestStates, 60 * 60 * 1000);