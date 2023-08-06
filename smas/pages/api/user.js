import { Pool } from "pg";
import jwt from "jsonwebtoken";
import { auth } from "@/components/Firebase";
import { getAuth } from "@firebase/auth";
import dotenv from "dotenv";

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "smas_db",
  password: "root",
  port: 5432,
});
export default async function handler(req, res) {
  const condition = req.body.condition;

  if (condition === "getUserByEmail") {
    const email = req.body.email;
    const query = `SELECT "Name","Mobile","Email","Designation","NewUser" FROM users WHERE "Email" = $1`;
    try {
      const response = await pool.query(query, [email]);
      res.status(200).json(response.rows[0]);
    } catch (err) {
      console.log(err);
      res.status(200).json(-1);
    }
    return;
  }

  const authHeader = req.headers.authorization;

  var token = authHeader && authHeader.split(" ")[1];
  var formDetails;
  console.log(condition);

  try {
    // formDetails = jwt.verify(formToken, "sakthiGethu");
    formDetails = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.log(err);
    res.status(200).json("Hacker Ahead..");
    return;
  }

  if (condition === "addUser") {
    const formDetails = await JSON.parse(req.body.formDetails);
    var query = `SELECT * from users WHERE "Mobile" = $1 or "Email" = $2`;
    const duplicate = await pool.query(query, [
      formDetails.mobile,
      formDetails.email,
    ]);
    if (duplicate.rowCount > 0) {
      res.status(200).json(-1);
      return;
    }
    query = `INSERT INTO users VALUES ($1, $2,$3,$4,$5, true) RETURNING *`;
    try {
      const response = await pool.query(query, [
        formDetails.name,
        formDetails.mobile,
        formDetails.email,
        formDetails.password,
        formDetails.designation,
      ]);
      res.status(200).json(1);
    } catch (err) {
      console.log(err);
      res.status(500).json(404);
    }
  } else if (condition === "fetchUsers") {
    const query = `SELECT "Name", "Mobile","Email","Designation" FROM users`;
    try {
      const response = await pool.query(query);
      res.status(200).json(response.rows);
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  } else if (condition == "deleteUser") {
    const row = await JSON.parse(req.body.row);
    const query = `DELETE FROM users WHERE "Mobile" = $1 RETURNING *`;
    try {
      const response = pool.query(query, [row.Mobile]);

      const accessDeleteQuery = `DELETE FROM accessrequests WHERE "Name" = $1`;
      const accessDeleteResponse = await pool.query(accessDeleteQuery, [
        row.Name,
      ]);
      res.status(200).json(1);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  } else if (condition == "login") {
    // const formToken = req.body.formDetails;

    // const query = `SELECT  FROM users WHERE "Mobile" = $1 AND "Password" = $2`;
    const query2 = `SELECT * FROM users WHERE "Mobile" = $1 AND "Password" = $2 AND "Email" = $3 AND "Name"= $4`;
    try {
      // const response = await pool.query(query, [
      //   formDetails.mobile,
      //   formDetails.password,
      // ]);
      const response2 = await pool.query(query2, [
        formDetails.Mobile,
        formDetails.Password,
        formDetails.Email,
        formDetails.Name,
      ]);
      // var token = "guest";
      if (response2.rows[0]) {
        token = jwt.sign(response2.rows[0], process.env.JWT_SECRET);
        // token = jwt.sign(response2.rows[0], "sakthiGethu");
        res.status(200).json({
          token,
          details: response2.rows[0],
        });
        return;
      }
      res.status(200).json(0);
    } catch (err) {
      console.log(err);
      res.status(200).json(err);
    }
  } else if (condition === "getMail") {
    const formDetails = await JSON.parse(req.body.formDetails);
    const query = `SELECT "Email" FROM users WHERE "Mobile" = $1 AND "Password" = $2`;
    try {
      const response = await pool.query(query, [
        formDetails.mobile,
        formDetails.password,
      ]);
      res.status(200).json(response.rows[0]);
    } catch (err) {
      console.log(err);
      res.status(200).json(err);
    }
  } else if (condition === "newUserPasswordUpdate") {
    const formDetails = await JSON.parse(req.body.formDetails);
    const userDetails = await JSON.parse(req.body.userDetails);
    const query = `UPDATE users SET "Password" = $1 , "NewUser" = 'false' WHERE "Mobile" = $2 AND "Email" = $3 RETURNING *`;
    try {
      const response = await pool.query(query, [
        formDetails,
        userDetails.Mobile,
        userDetails.Email,
      ]);
      res.status(200).json(1);
    } catch (err) {
      console.log(err);
      res.status(200).json(-1);
    }
  } else if (condition === "fetchAccessibility") {
    const token = req.body.token;
    const serialKey = req.body.serialKey;
    try {
      const userDetails = jwt.verify(token, process.env.JWT_SECRET);
      const query = `SELECT "EditAccess" FROM items WHERE "Serial_key" = $1`;
      const response = await pool.query(query, [serialKey]);
      const accessibleUsers = response.rows[0].EditAccess;

      if (
        accessibleUsers &&
        accessibleUsers.split(",").includes(userDetails.Mobile)
      ) {
        res.status(200).json(1);
      } else {
        res.status(200).json(0);
      }
      // res.status(200).json(accessibleUsers);
    } catch (err) {
      console.log(err);
      res.status(200).json(-1);
    }
  } else if (condition === "checkForUserData") {
    const formDetails = await JSON.parse(req.body.formDetails);
    const nameQuery = `SELECT "Name" FROM users WHERE "Name" = $1`;
    const emailQuery = `SELECT "Email" FROM users WHERE "Email" = $1`;
    const mobileQuery = `SELECT "Mobile" FROM users WHERE "Mobile" = $1`;
    try {
      const nameResponse = await pool.query(nameQuery, [formDetails.name]);
      if (nameResponse.rowCount > 0) {
        res.status(200).json("Name");
      } else {
        const emailResponse = await pool.query(emailQuery, [formDetails.email]);
        if (emailResponse.rowCount > 0) {
          res.status(200).json("Email");
        } else {
          const mobileResponse = await pool.query(mobileQuery, [
            formDetails.mobile,
          ]);
          if (mobileResponse.rowCount > 0) {
            res.status(200).json("Mobile");
          } else {
            res.status(200).json("None");
          }
        }
      }
    } catch (err) {
      console.log(err);
      res.status.json(-1);
    }
  }
}
