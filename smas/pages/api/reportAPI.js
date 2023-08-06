import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "smas_db",
  password: "root",
  port: 5432,
});
export default async function handler(req, res) {
  const condition = req.body.condition;
  console.log(condition);
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
  if (condition == "fetchItemDetails") {
    const year = req.body.year;
    const dateParts = year.split(".");
    const rearrangedDateString = `${dateParts[1]}/${dateParts[0]}/${dateParts[2]}`;

    const convertedDate = new Date(rearrangedDateString);
    console.log(convertedDate);
    const query = `SELECT * FROM items WHERE "Date" <= $1`;
    try {
      const response = await pool.query(query, [convertedDate]);
      res.status(200).json(response.rows);
    } catch (err) {
      console.log(err);
      res.status(200).json(-1);
    }
  } else if (condition == "fetchItemAmount") {
    const year = req.body.year;
    const dateParts = year.split(".");
    const rearrangedDateString = `${dateParts[1]}/${dateParts[0]}/${dateParts[2]}`;

    const convertedDate = new Date(rearrangedDateString);

    const query = `SELECT * FROM purchase_items WHERE "Date" <= $1`;
    try {
      const response = await pool.query(query, [convertedDate]);
      res.status(200).json(response.rows);
    } catch (err) {
      console.log(err);
      res.status(200).json(-1);
    }
  } else if (condition == "getLogReport") {
    const serialKey = req.body.serialKey;
    const serialCheckQuery = `SELECT "Serial_key" FROM items WHERE "Serial_key" = $1`;
    const checkResponse = await pool.query(serialCheckQuery, [serialKey]);
    console.log(checkResponse.rowCount);
    if (checkResponse.rowCount > 0) {
      const getLogQuery = `SELECT "Logs" FROM items WHERE "Serial_key" = $1`;
      const response = await pool.query(getLogQuery, [serialKey]);
      const logArray = await JSON.parse(response.rows[0].Logs);
      res.status(200).json(logArray);
    } else {
      res.status(200).json(-1);
    }
  } else if (condition == "getItemName") {
    const serialKey = req.body.serialKey;
    const query = `SELECT "Item_name" FROM items WHERE "Serial_key" = $1`;
    const response = await pool.query(query, [serialKey]);
    if (response.rowCount > 0) {
      res.status(200).json(response.rows[0]);
    } else {
      res.status(200).json(-1);
    }
  }
}
