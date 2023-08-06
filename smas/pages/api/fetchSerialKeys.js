import { Pool } from "pg";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "smas_db",
  password: "root",
  port: 5432,
});
export default async function handler(req, res) {
  // const authHeader = req.headers.authorization;

  // var token = authHeader && authHeader.split(" ")[1];
  const condition = req.body.condition;
  console.log(condition);
  // var formDetails;
  // try {
  //   formDetails = jwt.verify(token, process.env.JWT_SECRET);
  //   const userCheckQuery = `SELECT "Mobile" FROM users WHERE "Mobile" = $1 AND "Email" = $2`;
  //   const userCheckResponse = await pool.query(userCheckQuery, [
  //     formDetails.Mobile,
  //     formDetails.Email,
  //   ]);
  //   console.log(userCheckResponse);
  // } catch (err) {
  //   console.log(err);
  //   res.status(200).json(-2);
  // }
  if (condition === "used") {
    if (req.body.operation === "fetchSerialKeysOnCondition") {
      const locations = req.body.locations;
      try {
        const query = `SELECT "Serial_key", "StockPageNo", "StockSerialNo", "StockVolumeNo", "StockRegisterEntried" FROM items WHERE "Used" = true AND "Location_no" IN (SELECT "location_no" from item_location WHERE "location1" = $1 ${
          locations.location2 != "" ? `AND location2 = $2 ` : ``
        }${locations.location3 != "" ? `AND location3 = $3` : ``} )`;
        var result;
        if (locations.location2 != "" && locations.location3 != "") {
          result = await pool.query(query, [
            locations.location1,
            locations.location2,
            locations.location3,
          ]);
        } else if (locations.location2 != "" && locations.location3 == "") {
          result = await pool.query(query, [
            locations.location1,
            locations.location2,
          ]);
        } else if (locations.location2 == "") {
          result = await pool.query(query, [locations.location1]);
        }
        console.log("Response: Rows: ", result.rows);
        res.status(200).json(result.rows);
      } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
      }
    } else {
      try {
        const query = `SELECT "Serial_key", "StockPageNo", "StockSerialNo", "StockVolumeNo", "StockRegisterEntried" FROM items where "Used" = true ORDER BY "Date" desc`;
        const result = await pool.query(query, []);
        res.status(200).json(result.rows);
      } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
      }
    }
  } else if (condition === "new") {
    try {
      const query = `SELECT "Serial_key", "StockPageNo", "StockSerialNo", "StockVolumeNo", "StockRegisterEntried" FROM items where "Used" = false`;
      const result = await pool.query(query, []);
      res.status(200).json(result.rows);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  } else if (condition === "Component") {
    const component = req.body.component;
    const itemNavActive = req.body.itemNavActive;
    const usedBoolean = itemNavActive == "used" ? "true" : "false";
    try {
      const query = `SELECT "Serial_key" FROM items where "Item_name" = $1 and "Used" = $2`;
      const result = await pool.query(query, [component, usedBoolean]);
      res.status(200).json(result.rows);
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  }
}
