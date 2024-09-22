import { Router } from "express";
import { register } from "prom-client";
const router = Router();

router.get("/metrics", async (req, res) => {
  const metrics = await register.metrics();

  res.setHeader("Content-Type", register.contentType);
  res.send(metrics);
});

export default router;
