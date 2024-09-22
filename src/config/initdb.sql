CREATE TABLE users (
    accountid BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    balance BIGINT DEFAULT 100,
    verified_otp BOOLEAN DEFAULT FALSE,

    CHECK (accountid >= 10000000000 AND accountid <= 99999999999)
);
ALTER SEQUENCE users_accountid_seq RESTART WITH 10000000000;

CREATE TABLE otp (
    key INTEGER NOT NULL,
    verified_otp BOOLEAN DEFAULT FALSE,
    generated_for BIGINT NOT NULL,
    generated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE FUNCTION update_verified_otp()
RETURNS TRIGGER  AS  $$
BEGIN
    UPDATE users 
    SET verified_otp = true 
    WHERE accountid = NEW.generated_for;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER otp_verified_trigger
AFTER UPDATE OF verified_otp ON otp
FOR EACH ROW
EXECUTE FUNCTION update_verified_otp();