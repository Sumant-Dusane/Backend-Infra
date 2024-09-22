import express, { json } from "express";
import logger from "./lib/winston.mjs";
import { collectDefaultMetrics, Histogram, register } from "prom-client";

const app = express();
app.use(json());
const metricInterval = collectDefaultMetrics({ register });

const httpRequestMonitor = new Histogram({
  name: "http_requests_incoming",
  help: "Total http requests",
  labelNames: ["method", "route", "status"],
  buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500],
});

app.use((req, res, next) => {
  res.locals.startEpoch = Date.now();
  next();
});

app.get("/", (req, res, next) => {
  res.status(200).send("SHREE SWAMI SAMARTHA");
  next();
});

app.post("/", (req, res, next) => {
  try {
    const { a, b } = req.body;
    if ((1380 <= a && a <= 1500) || (1380 <= b && b <= 1500)) {
      throw "bug!!";
    }
    res.status(200).send({ result: a + b });
  } catch (error) {
    logger.error(`Error: ${error}`, { statusCode: 500 });
    res.status(500).send({ error });
  }
  next();
});

app.get("/metrics", async (req, res) => {
  const metrics = await register.metrics();

  res.setHeader("Content-Type", register.contentType);
  res.send(metrics);
});

// middleware to monitor http requests
app.use((req, res, next) => {
  const responseTime = Date.now() - res.locals.startEpoch;
  httpRequestMonitor
    .labels(req.method, req.route.path, res.statusCode)
    .observe(responseTime);
  next();
});

const server = app.listen(3000, () => logger.info("Server listening on 3000", {statusCode: 200}));

// graceful shutdown
process.on("SIGTERM", () => {
  clearInterval(metricInterval);
  server.close((err) => {
    if (err) {
      logger.error(err, {statusCode: 300});
      process.exit(1);
    }
    process.exit(0);
  });
});
