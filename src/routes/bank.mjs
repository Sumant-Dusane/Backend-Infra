import { Router } from "express";
import {
  createUser,
  getAllUser,
  getUserByAccountId,
  pay, verifyOtp, storeOTP
} from "../db/queries.mjs";
import logger from "../config/winston.mjs";
import { generateOTP } from "../helper/otp.mjs";
import { sendOTPEmail } from "../helper/emailer.mjs";

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const response = await getAllUser();
    res.status(200).send(response);
  } catch (err) {
    logger.error(err);
    res.status(500).send({ error: err });
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const accountId = req.params.id;
    const response = await getUserByAccountId(accountId);
    res.status(200).send({ response });
    logger.info("Fetched account successfully");
  } catch (err) {
    logger.error(err);
    res.status(500).send({ error: err });
  }
  next();
});

router.post("/pay", async (req, res, next) => {
  try {
    const { from, to, amount } = req.body;
    const response = await pay(from, to, amount);
    res.status(200).send({ response });
    logger.info("Payment done successfully");
  } catch (err) {
    logger.error(err);
    res.status(500).send({ error: err });
  }
  next();
});

router.post("/create", async (req, res, next) => {
  try {
    const { name, email, balance, dummyOtp } = req.body;
    const accountNumber = await createUser(name, email, balance);
    
    // run in bg
    (async () => {
      const otp = dummyOtp ? 444999 : generateOTP();
      await storeOTP(otp, accountNumber);
      await sendOTPEmail(otp, name, email);
    })();

    res.status(200).send({ message: "Successfully created new account", accountNumber: accountNumber });
    logger.info("Account created successfully");
  } catch (err) {
    logger.error(err);
    res.status(500).send({ error: err });
  }
  next();
});

router.post("/verify-otp", async (req, res, next) => {
  try {
    const { otp, from } = req.body;
    await verifyOtp(otp, from);
    res.status(200).send({ message: "User verified successfully" });
    logger.info("Otp verified successfully");
  } catch (err) {
    logger.error(err);
    res.status(500).send({ error: err });
  }
  next();
});

export default router;
