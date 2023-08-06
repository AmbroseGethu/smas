import { Pool } from "pg";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "smas_db",
  password: "root",
  port: 5432,
});
export default async function handler(req, res) {
  const serialKey = req.body.serialKey;
  const condition = req.body.condition;
  const authHeader = req.headers.authorization;

  var token = authHeader && authHeader.split(" ")[1];
  var formDetails;
  try {
    formDetails = jwt.verify(token, process.env.JWT_SECRET);
    const userCheckQuery = `SELECT "Mobile" FROM users WHERE "Mobile" = $1 AND "Email" = $2`;
    const userCheckResponse = await pool.query(userCheckQuery, [
      formDetails.Mobile,
      formDetails.Email,
    ]);
    if (userCheckResponse.rowCount == 0) {
      res.status(200).json(-2);
      return;
    }
  } catch (err) {
    console.log(err);
    res.status(200).json(-2);
    return;
  }
  if (condition === "Invoice") {
    try {
      const query = `SELECT * FROM purchase_items where "Serial_key" = $1`;
      const result = await pool.query(query, [serialKey]);
      res.status(200).json(result.rows);
    } catch (err) {
      console.log(err);
      res.status(500).json(-1);
    }
  } else if (condition === "Item") {
    try {
      const query = `SELECT * FROM items where "Serial_key" = $1`;
      const result = await pool.query(query, [serialKey]);
      res.status(200).json(result.rows);
    } catch (err) {
      console.log(err);
      res.status(500).json(-1);
    }
  } else if (condition === "delete") {
    console.log("serial KEY: ", serialKey);
    try {
      var query = `DELETE FROM items WHERE "Serial_key" = $1`;
      var response = await pool.query(query, [serialKey]);
      query = `DELETE FROM purchase_items WHERE "Serial_key" = $1 RETURNING *`;
      response = await pool.query(query, [serialKey]);
      res.status(200).json("deleted");
    } catch (err) {
      console.log(err);
      res.status(200).json(-1);
    }
  } else if (condition === "getUsed") {
    const skey = req.body.serialKey;
    console.log("serial key: ", skey);
    try {
      const query = `SELECT "Used" FROM items WHERE "Serial_key" = $1`;
      const response = await pool.query(query, [skey]);
      console.log("Response: ", response.rows);
      res.status(200).json(response.rows[0].Used);
    } catch (err) {
      console.log(err);
      res.status(200).json(-1);
    }
  }
}
