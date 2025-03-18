const promClient = require("prom-client");

const requestCounter = new promClient.Counter({
  name: "http_requests_total",
  help: "Total number of requests",
  labelNames: ["method", "route", "status"],
});

const requestDurationHistogram = new promClient.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status"],
});

const allRequests = [];

module.exports = (req, res, next) => {
  const end = requestDurationHistogram.startTimer();
  const route = req.route ? req.route.path : req.path;

  res.on("finish", () => {
    const requestDetails = {
      method: req.method,
      route,
      status: res.statusCode,
      timestamp: new Date().toISOString(),
    };

    allRequests.push(requestDetails);

    requestCounter.inc({ method: req.method, route, status: res.statusCode });
    end({ method: req.method, route, status: res.statusCode });
  });

  next();
};

module.exports.getAllRequests = () => allRequests;
