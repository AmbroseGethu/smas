import { Pool } from "pg";
import dotenv from "dotenv";
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
  if (condition === "updateItemDetails") {
    const formDetails = await JSON.parse(req.body.formDetails);
    const user = req.body.user;

    const query = `UPDATE purchase_items SET "Item_name" = $1, "Description" = $2 , "Quantity" = $3, "RatePerQuantity" = $4, "Rate" = $5, "Tax" = $6, "TaxRate" = $7, "TotalRate" = $8, "Reference_no" = $9, "PreOrdered" = $10 WHERE "Serial_key" = $11`;
    const itemUpdate = `UPDATE items SET "Item_name"  = $1 WHERE "Serial_key" = $2`;
    const fetchLog = `SELECT "Logs" FROM items WHERE "Serial_key"  = $1`;
    const updateLog = `UPDATE items SET "Logs" = $1 WHERE "Serial_key" = $1`;

    try {
      const logFetchResponse = await pool.query(fetchLog, [
        formDetails.serialKey,
      ]);
      var logArray = await JSON.parse(logFetchResponse.rows[0].Logs);
      logArray.push({
        operation: "editedItem",
        user: user,
        dateOfOperation: new Date().toDateString(),
      });
      logArray = JSON.stringify(logArray);
      const response = await pool.query(query, [
        formDetails.itemName,
        formDetails.description,
        formDetails.quantity,
        formDetails.ratePerQuantity,
        formDetails.rate,
        formDetails.taxInPercentage,
        formDetails.taxRate,
        formDetails.totalRate,
        formDetails.referenceNo,
        formDetails.preOrdered,
        formDetails.serialKey,
      ]);
      const response2 = await pool.query(itemUpdate, [
        formDetails.itemName,
        formDetails.serialKey,
      ]);
      const response3 = await pool.query(updateLog, [logArray]);

      res.status(200).json(1);
    } catch (err) {
      console.log(err);
      res.status(200).json(-1);
    }
  } else if (condition === "updateStockRegisterData") {
    const formDetails = req.body.formData;
    const user = req.body.user;
    const fetchLog = `SELECT "Logs" FROM items WHERE "Serial_key" = $1`;
    const logResponse = await pool.query(fetchLog, [formDetails.SerialKey]);
    var logArray = await JSON.parse(logResponse.rows[0].Logs);
    logArray.push({
      operation: "updatedStockRegister",
      user: user,
      dateOfOperation: new Date().toDateString(),
    });
    logArray = JSON.stringify(logArray);

    const query = `UPDATE items SET "StockPageNo" = $1 , "StockVolumeNo" = $2, "StockSerialNo" = $3, "StockRegisterEntried" = true WHERE "Serial_key" = $4 RETURNING *`;
    const response = await pool.query(query, [
      formDetails.StockPageNo,
      formDetails.StockVolumeNo,
      formDetails.StockSerialNo,
      formDetails.SerialKey,
    ]);
    const logUpdate = `UPDATE items SET "Logs" = $1 WHERE "Serial_key"  = $2`;
    const logUpdateResponse = await pool.query(logUpdate, [
      logArray,
      formDetails.SerialKey,
    ]);
    res.status(200).json(response);
  }
}
