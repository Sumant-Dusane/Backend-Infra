import logger from "../config/winston.mjs";
import pool from "./pg.mjs";

async function getAllUser() {
  try {
    const query = "SELECT * FROM users";
    const res = await pool.query(query);
    return res.rows;
  } catch (err) {
    throw "Error getting users:  " + err;
  }
}

async function getUserByAccountId(accountId) {
  try {
    const query = "SELECT * FROM users WHERE accountid = $1";
    const res = await pool.query(query, [accountId]);
    return res.rows[0];
  } catch (err) {
    throw "Error getting user:  " + err;
  }
}

async function createUser(name, email, balance) {
  try {
    const query = "INSERT INTO users (name, email, balance) VALUES ($1, $2, $3) RETURNING accountid";
    const res = await pool.query(query, [name, email, balance || 100]);
    return res.rows[0].accountid;
  } catch (err) {
    throw "Error creating new user:  " + err;
  }
}

async function storeOTP(key, generatedFor) {
  try {
    const query = "INSERT INTO otp (key, generated_for) VALUES ($1, $2)";
    const res = await pool.query(query, [key, generatedFor]);
    return res.rows[0];
  } catch (err) {
    // throw "Error storing new otp:  " + err;
    logger.error("Error storing new otp:  " + err);
  }
}

async function verifyOtp(otp, generatedFor) {
  try {
    const query =
      "SELECT * FROM otp WHERE key = $1 AND generated_for = $2 AND generated_on >= NOW() - INTERVAL '5 minutes' ";
    const res = await pool.query(query, [otp, generatedFor]);
    if (res.rowCount < 1) {
      throw "Invalid or expired Otp";
    }

    await pool.query('BEGIN');
    await pool.query('UPDATE otp SET verified_otp = $1 WHERE generated_for = $2', [true, generatedFor]);
    await pool.query('COMMIT');

  } catch (err) {
    throw "Error verifying otp: " + err;
  }
}

async function getBalance(accountId) {
  try {
    const res = await pool.query("SELECT * FROM users WHERE accountid = $1", [
      accountId,
    ]);
    return res.rows[0].balance;
  } catch (err) {
    throw "Error fetching user balance:  " + err;
  }
}

async function isUserVerified(accountId) {
  try {
    const res = await pool.query(
      "SELECT verified_otp FROM users WHERE accountid = $1",
      [accountId]
    );
    return res.rows[0].verified_otp;
  } catch (err) {
    throw "Error while verifying user status:  " + err;
  }
}

async function pay(from, to, amount) {
  try {
    const balance = await getBalance(from);
    const payeeUserVerified = await isUserVerified(from);
    if (!payeeUserVerified) {
      throw "Payee not verified";
    }
    const receiverUserVerified = await isUserVerified(to);
    if (!receiverUserVerified) {
      throw "Receiver not verified";
    }
    if (balance < amount) {
      throw "Insufficient account balance";
    }

    await pool.query('BEGIN');
    await pool.query('UPDATE users SET balance = balance - $1 WHERE accountid = $2', [amount, from]);
    await pool.query('SAVEPOINT deduct_savepoint');
    await pool.query('UPDATE users SET balance = balance + $1 WHERE accountid = $2', [amount, to]);
    await pool.query('SAVEPOINT complete_transaction_savepoint');
    await pool.query('RELEASE SAVEPOINT deduct_savepoint');
    await pool.query('COMMIT');

    return "Payment done successfully.";
  } catch (err) {
    throw "Error completing transaction:  " + err;
  }
}

export { getAllUser, getUserByAccountId, createUser, storeOTP, verifyOtp, getBalance, pay };

/*

users
{
name: string, notnull
accountid: number, primary key, not null
createdon: Date, notnull,
balance: bigint, notnull,
verified_otp: boolean
}


otp
{
key: int
used: boolean,
generated_for: string
generated_on: Date,
}

*/
