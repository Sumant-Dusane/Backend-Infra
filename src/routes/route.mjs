import { Router } from "express";
import metricsRouter from "./metrics.mjs";
import bankRouter from "./bank.mjs";
import logger from "../config/winston.mjs";

const router = Router();

router.get("/", (req, res, next) => {
  res.status(200).send("SHREE SWAMI SAMARTHA");
  next();
});

router.post("/", (req, res, next) => {
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

router.use('/bank', bankRouter);

router.use('/metrics', metricsRouter)

export default router;
