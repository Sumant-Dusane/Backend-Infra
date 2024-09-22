import express, { json } from "express";
import logger from "./config/winston.mjs";
import { addStartTime, handlePostReqMonitoring } from "./middleware/core_middleware.mjs";
import { metricInterval } from "./config/metrics.mjs";
import router from "./routes/route.mjs";

const app = express();
app.use(json());
app.use(addStartTime);
app.use("/", router);
app.use(handlePostReqMonitoring);

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
