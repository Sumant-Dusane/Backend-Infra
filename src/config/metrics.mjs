import { collectDefaultMetrics, Histogram, register } from "prom-client";

const metricInterval = collectDefaultMetrics({ register });

const httpRequestMonitor = new Histogram({
  name: "http_requests_incoming",
  help: "Total http requests",
  labelNames: ["method", "route", "status"],
  buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500],
});

export {
    metricInterval,
    httpRequestMonitor
}
