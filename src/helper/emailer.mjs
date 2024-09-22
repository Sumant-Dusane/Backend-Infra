import { Resend } from "resend";
import logger from "../config/winston.mjs";

const resend = new Resend("re_861ThXE1_MJNrKCJZcfPRX478pWmbqZhc");

const sendOTPEmail = async (otp, name, email) => {
  const res = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "OTP for creating new account",
    html: `<h1>HELLO, ${name}</h1> <br /> <p>OTP for verifying your account is: ${otp}</p>`,
  });
  if (res.error) {
    logger.error("Unable to send email: " + JSON.stringify(res.error));
  }
  return res.data;
};

export { sendOTPEmail };
