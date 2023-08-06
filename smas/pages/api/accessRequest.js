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
  if (condition === "requestAccess") {
    const serialKey = req.body.serialKey;
    const userToken = req.body.userToken;
    try {
      const userDetails = jwt.verify(userToken, process.env.JWT_SECRET);
      const fetchQuery = `SELECT "Serial_key" FROM accessrequests WHERE "Mobile" = $1`;
      const requestKeysResponse = await pool.query(fetchQuery, [
        userDetails.Mobile,
      ]);
      var requestKeys = 0;
      if (requestKeysResponse.rowCount > 0) {
        requestKeys = requestKeysResponse.rows[0].Serial_key;
      }

      if (requestKeys != 0) {
        if (requestKeys.split(",").includes(serialKey)) {
          res.status(200).json("Request Already exists..");
          return;
        }
        requestKeys += `,${serialKey}`;
      } else {
        requestKeys = `${serialKey}`;
      }

      try {
        const checkQuery = `SELECT "Mobile" FROM accessrequests WHERE "Mobile" = $1`;
        const checkResponse = await pool.query(checkQuery, [
          userDetails.Mobile,
        ]);
        if (checkResponse.rowCount > 0) {
          try {
            const updateQuery = `UPDATE accessrequests SET "Serial_key" = $1 WHERE "Mobile" = $2 RETURNING *`;
            const updateResponse = pool.query(updateQuery, [
              requestKeys,
              userDetails.Mobile,
            ]);
            res.status(200).json(updateResponse.rows[0]);
          } catch (err) {
            console.log(err);
            res.status(200).json(-1);
          }
        } else {
          try {
            const insertQuery = `INSERT INTO accessrequests VALUES ($1,$2, $3) RETURNING *`;
            const insertResponse = await pool.query(insertQuery, [
              userDetails.Mobile,
              requestKeys,
              userDetails.Name,
            ]);
            res.status(200).json(insertResponse.rows[0]);
          } catch (err) {
            console.log(err);
            res.status(200).json(-1);
          }
        }
      } catch (err) {
        console.log(err);
        res.status(200).json(-1);
      }
    } catch (err) {
      console.log(err);
      res.status(200).json(-1);
    }
  } else if (condition === "fetchRequests") {
    const token = req.body.userToken;
    try {
      const userDetails = jwt.verify(token, process.env.JWT_SECRET);
      const checkUser = `SELECT "Mobile" FROM users WHERE "Mobile" = $1 AND "Email" = $2 AND "Password" = $3`;
      const userResponse = await pool.query(checkUser, [
        userDetails.Mobile,
        userDetails.Email,
        userDetails.Password,
      ]);
      if (userResponse.rowCount > 0) {
        const fetchRequests = `SELECT * FROM accessrequests`;
        const requestResponse = await pool.query(fetchRequests);
        res.status(200).json(requestResponse.rows);
      } else {
        res.status(200).json("User Authentication Failed..");
      }
    } catch (err) {
      console.log(err);
      res.status(200).json(-1);
    }
  } else if (condition === "rejectAccess") {
    const name = req.body.name;
    const skey = req.body.skey;
    const fetchQuery = `SELECT "Serial_key" FROM accessrequests WHERE "Name" = $1`;
    try {
      const fetchResponse = await pool.query(fetchQuery, [name]);
      const serial_key = fetchResponse.rows[0].Serial_key;
      const serialKeysArray = serial_key.split(",");
      if (serialKeysArray.length == 1) {
        const deleteQuery = `DELETE FROM accessrequests WHERE "Name" = $1`;
        const deleteResponse = await pool.query(deleteQuery, [name]);
        res.status(200).json(1);
        return;
      }
      const filteredKeys = serialKeysArray.filter((key) => key != skey);
      const newKey = filteredKeys.join(",");
      const updateQuery = `UPDATE accessrequests SET "Serial_key" = $1 WHERE "Name" = $2`;
      const updateResponse = await pool.query(updateQuery, [newKey, name]);

      res.status(200).json(1);
    } catch (err) {
      console.log(err);
      res.status(200).json(-1);
    }
  } else if (condition === "acceptAccess") {
    const mobile = req.body.mobile;
    const skey = req.body.skey;

    const fetchAccessQuery = `SELECT "EditAccess" FROM items WHERE "Serial_key" = $1`;
    try {
      const fetchResponse = await pool.query(fetchAccessQuery, [skey]);
      var EditAccessList = fetchResponse.rows[0].EditAccess;
      if (EditAccessList == null) {
        EditAccessList = `${mobile}`;
      } else {
        EditAccessList += `,${mobile}`;
      }

      const addAccessQuery = `UPDATE items SET "EditAccess" = $1 WHERE "Serial_key" = $2`;
      const addAccessResponse = await pool.query(addAccessQuery, [
        EditAccessList,
        skey,
      ]);
      const fetchQuery = `SELECT "Serial_key" FROM accessrequests WHERE "Mobile" = $1`;
      const fetchResponse2 = await pool.query(fetchQuery, [mobile]);
      const serialKeyResponse = fetchResponse2.rows[0].Serial_key;
      const serialKeyArray = serialKeyResponse.split(",");
      if (serialKeyArray.length == 1) {
        const updateAccessRequestQuery = `DELETE FROM accessRequests WHERE "Mobile" = $1`;
        const updateAccessRequestResponse = await pool.query(
          updateAccessRequestQuery,
          [mobile]
        );
      } else {
        const filteredKeys = serialKeyArray.filter((key) => key != skey);
        const newKeys = filteredKeys.join(",");
        const updateAccessRequestQuery = `UPDATE accessrequests SET "Serial_key" = $1 WHERE "Mobile" = $2`;
        const updateAccessResponse = await pool.query(
          updateAccessRequestQuery,
          [newKeys, mobile]
        );
      }
      res.status(200).json(1);
    } catch (err) {
      console.log(err);
      res.status(200).json(-1);
    }
  }
}
