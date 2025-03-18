const express = require("express");
const promClient = require("prom-client");
const loggerMiddleware = require("./utils/loggerMiddleware"); // Adjust the import path as necessary

const metricsApp = express();
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();

metricsApp.use(loggerMiddleware);

metricsApp.get("/metrics", async (req, res) => {
  res.set("Content-Type", promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

metricsApp.get("/all-requests", (req, res) => {
  res.json(loggerMiddleware.getAllRequests());
});

const metricsPort = 3003; // Port for the metrics server
metricsApp.listen(metricsPort, () => {
  console.log(`Metrics server is running on port ${metricsPort}`);
});
