import { Pool } from "pg";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const generateRandomKey = () => {
  return crypto.randomBytes(64).toString("hex");
};

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "smas_db",
  password: "root",
  port: 5432,
});
export default async function handler(req, res) {
  const condition = req.body.condition;
  console.log("CONDITON : ", condition);

  // const key = "sakthiGethu";
  const key = generateRandomKey();

  if (condition == "getJWT") {
    const formDetails = JSON.parse(req.body.formDetails);
    const query = `SELECT "Mobile" FROM users WHERE "Mobile" = $1 AND "Password" = $2`;
    try {
      const response = await pool.query(query, [
        formDetails.mobile,
        formDetails.password,
      ]);
      if (response.rowCount > 0) {
        try {
          const response2 = await pool.query(
            `SELECT * FROM users WHERE "Mobile" = $1 AND "Password" = $2`,
            [formDetails.mobile, formDetails.password]
          );
          fs.writeFileSync(".env", `JWT_SECRET=${key}`);
          process.env.JWT_SECRET = key;

          const token = jwt.sign(response2.rows[0], key);
          res.status(200).json(token);
        } catch (err) {
          console.log(err);
          res.status(200).json(-1);
        }
      } else {
        res.status(200).json(0);
      }
    } catch (err) {
      console.log(err);
      res.status(200).json(-1);
    }
  } else if (condition === "getJWTWithoutPassword") {
    const formDetails = JSON.parse(req.body.formDetails);
    const query = `SELECT "Mobile" FROM users WHERE "Mobile" = $1 AND "Email" = $2`;
    try {
      const response = await pool.query(query, [
        formDetails.Mobile,
        formDetails.Email,
      ]);
      if (response.rowCount > 0) {
        try {
          const userQuery = `SELECT * FROM users WHERE "Mobile" = $1`;
          const userResponse = await pool.query(userQuery, [
            formDetails.Mobile,
          ]);

          // const token = jwt.sign(userResponse.rows[0], "sakthiGethu");
          const token = jwt.sign(userResponse.rows[0], process.env.JWT_SECRET);
          res.status(200).json(token);
        } catch (err) {
          console.log(err);
          res.status(200).json(-1);
        }
      } else {
        res.status(200).json(0);
      }
    } catch (err) {
      console.log(err);
      res.status(200).json(-1);
    }
  } else if (condition == "getJWTByEmail") {
    const email = req.body.email;
    const query = `SELECT * FROM users WHERE "Email" = $1`;
    try {
      const response = await pool.query(query, [email]);
      const formDetails = response.rows[0];
      // console.log(formDetails);

      try {
        // const token = jwt.sign(formDetails, key);
        const token = jwt.sign(formDetails, process.env.JWT_SECRET);
        res.status(200).json(token);
      } catch (err) {
        console.log(err);
        res.status(200).json(-1);
      }
    } catch (err) {
      console.log(err);
      res.status(200).json(-1);
    }
  }
}
