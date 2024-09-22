import { httpRequestMonitor } from "./../config/metrics.mjs";

const addStartTime = (req, res, next) => {
  res.locals.startEpoch = Date.now();
  next();
};

// middleware to monitor http requests
const handlePostReqMonitoring = (req, res, next) => {
  const responseTime = Date.now() - res.locals.startEpoch;
  const path = req.path;
  httpRequestMonitor
    .labels(req.method, path, res.statusCode)
    .observe(responseTime);
  next();
};

export { addStartTime, handlePostReqMonitoring };
